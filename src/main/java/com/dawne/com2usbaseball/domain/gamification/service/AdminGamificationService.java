package com.dawne.com2usbaseball.domain.gamification.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.gamification.dto.request.AdjustRequest;
import com.dawne.com2usbaseball.domain.gamification.dto.request.TitleActionRequest;
import com.dawne.com2usbaseball.domain.gamification.dto.response.EarlyAdopterGrantResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.response.LedgerItemResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.response.LedgerPageResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.response.AdminTitleResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.response.TitleGrantResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.response.TitleRevokeResponse;
import com.dawne.com2usbaseball.domain.gamification.entity.EarlyCandidateEntity;
import com.dawne.com2usbaseball.domain.gamification.entity.LedgerEntity;
import com.dawne.com2usbaseball.domain.gamification.entity.TitleEntity;
import com.dawne.com2usbaseball.domain.gamification.repository.GamificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.Set;
import java.util.UUID;

import static com.dawne.com2usbaseball.domain.gamification.enums.GamificationMessages.*;

/** 운영자 도구 — 얼리어답터 일괄 지급(dryRun 기본), 지급/회수, 원장 조회. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminGamificationService {

    private static final LocalDate VISIT_FROM = LocalDate.of(2026, 10, 1);
    private static final int SAMPLE_SIZE = 5;
    private static final int LEDGER_SIZE = 20;

    private final GamificationRepository repository;
    private final GamificationService gamificationService;
    private final RewardService rewardService;

    /**
     * 얼리어답터(FOUNDER): site_titles 의 가입 기간(signup_from~signup_to, 양 끝 포함)에 가입 + 10-01 이후 방문한 활성 계정.
     * 기간·보너스는 DB 값을 읽는다. dryRun=true 면 건수·샘플만 돌려주고 기록하지 않는다.
     */
    @Transactional
    public EarlyAdopterGrantResponse grantEarlyAdopters(boolean dryRun) {
        TitleEntity founder = repository.findTitleByCode("FOUNDER")
                .orElseThrow(() -> new BaseException(GAMIFICATION_TITLE_NOT_FOUND, HttpStatus.NOT_FOUND));
        LocalDateTime from = (founder.getSignupFrom() == null ? LocalDate.EPOCH : founder.getSignupFrom()).atStartOfDay();
        LocalDateTime to = founder.getSignupTo() == null
                ? LocalDateTime.now() : founder.getSignupTo().plusDays(1).atStartOfDay();
        LocalDateTime since = VISIT_FROM.atStartOfDay();
        Set<Long> visited = new HashSet<>(repository.findVisitedUserIds(since));
        List<EarlyCandidateEntity> founders = repository.findEarlyCandidates(from, to).stream()
                .filter(c -> visited.contains(c.getId())
                        || (c.getLastLoginAt() != null && !c.getLastLoginAt().isBefore(since)))
                .toList();
        if (!dryRun) {
            founders.forEach(c -> gamificationService.grantTitle(c.getId(), "FOUNDER"));
        }
        List<String> samples = founders.stream().limit(SAMPLE_SIZE).map(EarlyCandidateEntity::getPublicId).toList();
        return new EarlyAdopterGrantResponse(dryRun, founders.size(), samples);
    }

    /** 운영자 지급/회수. 음수 허용, 사유 필수, 호출마다 새 키(ADMIN:uuid). */
    @Transactional
    public LedgerPageResponse adjust(AdjustRequest request) {
        if (request.xp() == 0 && request.point() == 0) {
            throw new BaseException(GAMIFICATION_ADJUST_INVALID, HttpStatus.BAD_REQUEST);
        }
        Long userId = requireUserId(request.publicId());
        rewardService.grant(userId, "ADMIN:" + UUID.randomUUID(), "ADMIN",
                request.xp(), request.point(), null, request.reason());
        return ledger(request.publicId());
    }

    public LedgerPageResponse ledger(String publicId) {
        Long userId = requireUserId(publicId);
        LedgerEntity sums = repository.findSums(userId);
        return new LedgerPageResponse(publicId, sums.getXpDelta(), sums.getPointDelta(),
                repository.findLedger(userId, LEDGER_SIZE).stream().map(LedgerItemResponse::of).toList());
    }

    /** 전체 칭호 정의 + 이 유저 보유 여부. */
    public List<AdminTitleResponse> titles(String publicId) {
        Map<String, TitleEntity> owned = repository.findOwnedTitles(requireUserId(publicId)).stream()
                .collect(Collectors.toMap(TitleEntity::getCode, Function.identity()));
        return repository.findAllTitles().stream().map(t -> {
            TitleEntity mine = owned.get(t.getCode());
            return new AdminTitleResponse(t.getCode(), t.getName(), t.getCategory(), t.getBonusPoint(),
                    mine != null, mine != null && mine.isEquipped(), mine == null ? null : mine.getGrantedAt());
        }).toList();
    }

    /** MANUAL 칭호 지급. 이미 보유면 granted=false (원장 행 없음). */
    @Transactional
    public TitleGrantResponse grantTitle(TitleActionRequest request, Long adminUserId) {
        Long userId = requireUserId(request.publicId());
        TitleEntity title = requireManualTitle(request.code());
        RewardService.requirePilot(userId);
        if ("GM".equals(title.getCode()) && !"ADMIN".equals(repository.findUserRole(userId))) {
            throw new BaseException(GAMIFICATION_GM_ADMIN_ONLY, HttpStatus.FORBIDDEN);
        }
        boolean had = hasTitle(userId, title.getCode());
        if (!had) {
            // 회수 후 재지급도 보너스가 들어가도록 호출마다 새 키 — 중복 방지는 보유 여부(had)가 맡는다
            gamificationService.grantTitle(userId, title.getCode(),
                    "ADMIN_TITLE:" + userId + ":" + title.getCode() + ":" + UUID.randomUUID(),
                    "칭호 지급 by " + adminPublicId(adminUserId));
        }
        return new TitleGrantResponse(title.getCode(), !had && hasTitle(userId, title.getCode()), title.getBonusPoint());
    }

    /** MANUAL 칭호 회수. 행 삭제(장착도 함께 사라짐) + 보너스 음수 한 줄. 미보유면 revoked=false. */
    @Transactional
    public TitleRevokeResponse revokeTitle(TitleActionRequest request, Long adminUserId) {
        Long userId = requireUserId(request.publicId());
        TitleEntity title = requireManualTitle(request.code());
        RewardService.requirePilot(userId);
        boolean revoked = repository.deleteUserTitle(userId, title.getId());
        if (revoked && title.getBonusPoint() > 0) {
            rewardService.grant(userId, "TITLE_REVOKE:" + userId + ":" + title.getCode() + ":" + UUID.randomUUID(),
                    "TITLE", 0, -title.getBonusPoint(), title.getCode(), "칭호 회수 by " + adminPublicId(adminUserId));
        }
        return new TitleRevokeResponse(title.getCode(), revoked, title.getBonusPoint());
    }

    private String adminPublicId(Long adminUserId) {
        return repository.findPublicIdByUserId(adminUserId).orElse(String.valueOf(adminUserId));
    }

    private TitleEntity requireManualTitle(String code) {
        TitleEntity title = repository.findTitleByCode(code)
                .orElseThrow(() -> new BaseException(GAMIFICATION_TITLE_NOT_FOUND, HttpStatus.NOT_FOUND));
        if (!"MANUAL".equals(title.getCategory())) {
            throw new BaseException(GAMIFICATION_TITLE_NOT_MANUAL, HttpStatus.BAD_REQUEST);
        }
        return title;
    }

    private boolean hasTitle(Long userId, String code) {
        return repository.findOwnedTitles(userId).stream().anyMatch(t -> t.getCode().equals(code));
    }

    private Long requireUserId(String publicId) {
        return repository.findUserIdByPublicId(publicId)
                .orElseThrow(() -> new BaseException(GAMIFICATION_USER_NOT_FOUND, HttpStatus.NOT_FOUND));
    }
}
