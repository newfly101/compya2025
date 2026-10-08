package com.dawne.com2usbaseball.domain.gamification.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.gamification.dto.response.*;
import com.dawne.com2usbaseball.domain.gamification.dto.response.GamificationMeResponse.TitleItem;
import com.dawne.com2usbaseball.domain.gamification.entity.LedgerEntity;
import com.dawne.com2usbaseball.domain.gamification.entity.RewardLevelEntity;
import com.dawne.com2usbaseball.domain.gamification.entity.RewardRuleEntity;
import com.dawne.com2usbaseball.domain.gamification.entity.TitleEntity;
import com.dawne.com2usbaseball.domain.gamification.repository.GamificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.dawne.com2usbaseball.domain.gamification.enums.GamificationMessages.*;

/** 체크인·저장 XP·연속 출석·활동 칭호·마이페이지 조회·대표 칭호 장착. */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GamificationService {

    private static final int RECENT_SIZE = 20;
    private static final int STREAK_LOOKBACK = 60;
    private static final int HISTORY_SIZE = 20;
    // 칭호 얻는 조건 문구 — 컬럼 추가(DDL) 없이 서비스에 둔다. 칭호가 늘면 여기도 추가
    private static final Map<String, String> TITLE_CONDITIONS = Map.of(
            "FOUNDER", "2026-01-28 ~ 06-01 사이에 가입하고 10-01 이후 방문",
            "ATTENDANCE_7", "7일 연속 출석",
            "IRON_30", "30일 연속 출석",
            "BUG_HUNTER", "버그를 제보하면 운영자가 수여",
            "GM", "운영자 전용");

    private final GamificationRepository repository;
    private final RewardService rewardService;

    @Transactional
    public CheckInResponse checkIn(Long userId) {
        LocalDate today = RewardService.today();
        RewardRuleEntity rule = rule("CHECKIN");
        List<RewardLevelEntity> levels = repository.findLevels();
        int levelBefore = RewardService.levelOf(repository.findSums(userId).getXpDelta(), levels);
        boolean first = rewardService.grant(userId, "CHECKIN:" + userId + ":" + today, "CHECKIN",
                rule.getXp(), rule.getPoint(), null, "하루 첫 방문");
        if (!first) {
            return checkInResult(userId, levels, 0, 0, levelBefore);
        }
        int point = rule.getPoint();
        int streak = streakOf(userId, today);
        if (streak % 7 == 0) {
            RewardRuleEntity streakRule = rule("STREAK7");
            if (rewardService.grant(userId, "STREAK7:" + userId + ":" + today, "STREAK7",
                    streakRule.getXp(), streakRule.getPoint(), null, "7일 연속 출석")) {
                point += streakRule.getPoint();
            }
        }
        Set<String> owned = ownedCodes(userId);
        if (streak >= 7) grantTitleIfNew(userId, "ATTENDANCE_7", owned);
        if (streak >= 30) grantTitleIfNew(userId, "IRON_30", owned);
        return checkInResult(userId, levels, rule.getXp(), point, levelBefore);
    }

    private CheckInResponse checkInResult(Long userId, List<RewardLevelEntity> levels, int xp, int point, int levelBefore) {
        int level = RewardService.levelOf(repository.findSums(userId).getXpDelta(), levels);
        String name = levels.stream().filter(l -> l.getLevel() == level).map(RewardLevelEntity::getName)
                .findFirst().orElse(null);
        return new CheckInResponse(xp, point, level, name, level > levelBefore);
    }

    /** 칭호 정의 전체 + 내 보유·대표 여부. */
    public List<TitleDefResponse> getTitles(Long userId) {
        Map<String, TitleEntity> owned = repository.findOwnedTitles(userId).stream()
                .collect(Collectors.toMap(TitleEntity::getCode, Function.identity()));
        return repository.findAllTitles().stream().map(t -> {
            TitleEntity mine = owned.get(t.getCode());
            return new TitleDefResponse(t.getCode(), t.getName(), t.getCategory(),
                    TITLE_CONDITIONS.getOrDefault(t.getCode(), "MANUAL".equals(t.getCategory()) ? "운영자가 지급" : ""), t.getBonusPoint(),
                    mine != null, mine != null && mine.isEquipped());
        }).toList();
    }

    public List<LevelItemResponse> getLevels() {
        return repository.findLevels().stream().map(LevelItemResponse::of).toList();
    }

    /** type 은 XP 또는 POINT. 21건을 읽어 20건만 돌려주고 남으면 hasNext. */
    public LedgerHistoryResponse getHistory(Long userId, String type, int page) {
        if ((!"XP".equals(type) && !"POINT".equals(type)) || page < 0) {
            throw new BaseException(GAMIFICATION_INVALID_TYPE, HttpStatus.BAD_REQUEST);
        }
        List<LedgerEntity> rows = repository.findLedgerPage(userId, type, page * HISTORY_SIZE, HISTORY_SIZE + 1);
        return new LedgerHistoryResponse(type, page, HISTORY_SIZE, rows.size() > HISTORY_SIZE,
                rows.stream().limit(HISTORY_SIZE).map(LedgerItemResponse::of).toList());
    }

    /** 저장 한 번 — 하루 한도까지 XP, 첫 저장 보너스. */
    @Transactional(propagation = Propagation.REQUIRES_NEW) // AFTER_COMMIT 단계에서 불려도 따로 커밋되도록
    public void onSaved(Long userId) {
        LocalDate today = RewardService.today();
        repository.insertActivity(userId, "SAVE", today);
        int todayCount = repository.countActivity(userId, "SAVE", today);
        RewardRuleEntity save = rule("SAVE");
        if (save.getDailyLimit() == null || todayCount <= save.getDailyLimit()) {
            rewardService.grant(userId, "SAVE:" + userId + ":" + today + ":" + todayCount, "SAVE",
                    save.getXp(), save.getPoint(), null, "저장");
        }
        RewardRuleEntity first = rule("FIRST_SAVE");
        rewardService.grant(userId, "FIRST_SAVE:" + userId, "FIRST_SAVE", first.getXp(), first.getPoint(), null, "첫 저장");
    }

    /** 칭호 지급 + 보너스 포인트 (둘 다 중복 안전). 마감일이 지났거나 정의 없는 칭호는 건너뛴다. */
    @Transactional
    public boolean grantTitle(Long userId, String code) {
        return grantTitle(userId, code, "TITLE:" + userId + ":" + code, null);
    }

    /** 원장 키·사유를 호출자가 정하는 지급 (관리자 수동 지급용). reason 이 null 이면 "{칭호명} 칭호". */
    @Transactional
    public boolean grantTitle(Long userId, String code, String rewardKey, String reason) {
        TitleEntity title = repository.findTitleByCode(code).orElse(null);
        if (title == null) {
            log.warn("정의되지 않은 칭호 코드라 지급을 건너뜀: {}", code);
            return false;
        }
        if (title.getGrantEnd() != null && RewardService.today().isAfter(title.getGrantEnd())) {
            return false;
        }
        repository.insertUserTitleIfAbsent(userId, title.getId());
        return rewardService.grant(userId, rewardKey, "TITLE", 0,
                title.getBonusPoint(), code, reason != null ? reason : title.getName() + " 칭호");
    }

    public GamificationMeResponse getMe(Long userId) {
        LedgerEntity sums = repository.findSums(userId);
        List<RewardLevelEntity> levels = repository.findLevels();
        int xp = sums.getXpDelta();
        int level = RewardService.levelOf(xp, levels);
        Map<Integer, RewardLevelEntity> byLevel = levels.stream()
                .collect(Collectors.toMap(RewardLevelEntity::getLevel, Function.identity()));
        RewardLevelEntity current = byLevel.get(level);
        RewardLevelEntity next = byLevel.get(level + 1);
        List<TitleEntity> owned = repository.findOwnedTitles(userId);
        String equipped = owned.stream().filter(TitleEntity::isEquipped).map(TitleEntity::getCode).findFirst().orElse(null);
        return new GamificationMeResponse(
                xp, level, current == null ? null : current.getName(),
                next == null ? null : next.getRequiredXp(), sums.getPointDelta(),
                owned.stream().map(t -> new TitleItem(t.getCode(), t.getName(), t.isEquipped())).toList(),
                equipped,
                repository.findLedger(userId, RECENT_SIZE).stream().map(LedgerItemResponse::of).toList());
    }

    /** code 가 null 이면 해제. 보유하지 않은 칭호는 400. */
    @Transactional
    public GamificationMeResponse equipTitle(Long userId, String code) {
        if (code == null || code.isBlank()) {
            repository.clearEquipped(userId);
        } else {
            TitleEntity target = repository.findOwnedTitles(userId).stream()
                    .filter(t -> t.getCode().equals(code)).findFirst()
                    .orElseThrow(() -> new BaseException(GAMIFICATION_TITLE_NOT_OWNED, HttpStatus.BAD_REQUEST));
            repository.clearEquipped(userId);
            repository.equip(userId, target.getId());
        }
        return getMe(userId);
    }

    private RewardRuleEntity rule(String type) {
        return repository.findRules().stream().filter(r -> r.getActivityType().equals(type)).findFirst()
                .orElseThrow(() -> new BaseException(GAMIFICATION_RULE_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR));
    }

    private Set<String> ownedCodes(Long userId) {
        return repository.findOwnedTitles(userId).stream().map(TitleEntity::getCode).collect(Collectors.toSet());
    }

    private void grantTitleIfNew(Long userId, String code, Set<String> owned) {
        if (!owned.contains(code) && grantTitle(userId, code)) {
            owned.add(code);
        }
    }

    /** 오늘부터 거꾸로 이어진 체크인 일수. */
    private int streakOf(Long userId, LocalDate today) {
        Set<LocalDate> dates = Set.copyOf(repository.findCheckinDates(userId, STREAK_LOOKBACK));
        int streak = 0;
        for (LocalDate d = today; dates.contains(d); d = d.minusDays(1)) {
            streak++;
        }
        return streak;
    }
}
