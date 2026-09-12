package com.dawne.com2usbaseball.domain.admin.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.admin.dto.response.CacheSyncResultResponse;
import com.dawne.com2usbaseball.domain.admin.dto.response.CacheSyncTargetResponse;
import com.dawne.com2usbaseball.domain.admin.enums.CacheSyncMessages;
import com.dawne.com2usbaseball.domain.coupon.service.AdminCouponService;
import com.dawne.com2usbaseball.domain.coupon.service.CouponUserService;
import com.dawne.com2usbaseball.domain.event.service.EventAdminService;
import com.dawne.com2usbaseball.domain.event.service.EventUserService;
import com.dawne.com2usbaseball.domain.fun.historyMode.service.FunHistoryModeService;
import com.dawne.com2usbaseball.domain.fun.legendStat.service.FunLegendStatService;
import com.dawne.com2usbaseball.domain.fun.mileage.service.MileageService;
import com.dawne.com2usbaseball.domain.fun.playerCard.service.PlayerCardService;
import com.dawne.com2usbaseball.domain.fun.playerSkill.service.PlayerSkillService;
import com.dawne.com2usbaseball.domain.notice.service.NoticeService;
import com.dawne.com2usbaseball.domain.quiz.enums.QuizMessages;
import com.dawne.com2usbaseball.domain.quiz.service.QuizAdminService;
import com.dawne.com2usbaseball.domain.quiz.service.QuizUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 어드민이 SQL로 DB를 직접 고친 뒤, 서버 재시작 없이 해당 컨텐츠 캐시만 골라 비우고
 * 다시 채우는 기능. spring.cache.type=simple 이라 캐시가 JVM 메모리 안에만 있어
 * DB를 직접 고쳐도 서버가 모른다 — 이 기능이 그 간극을 메운다.
 *
 * 한계 — 서버가 여러 대로 늘어나면 이 API를 받은 서버 하나만 비워진다(다른 서버는 여전히 옛 캐시).
 * 지금은 서버가 한 대라 문제없지만, 여러 대가 되면 메시지 브로드캐스트(Redis pub/sub 등)로 바꿔야 한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CacheSyncServiceImpl implements CacheSyncService {

    private final CacheManager cacheManager;

    private final MileageService mileageService;
    private final PlayerCardService playerCardService;
    private final PlayerSkillService playerSkillService;
    private final FunLegendStatService funLegendStatService;
    private final FunHistoryModeService funHistoryModeService;
    private final QuizAdminService quizAdminService;
    private final QuizUserService quizUserService;
    private final EventAdminService eventAdminService;
    private final EventUserService eventUserService;
    private final AdminCouponService adminCouponService;
    private final CouponUserService couponUserService;
    private final NoticeService noticeService;

    // 마지막 동기화 시각 — 서버 메모리에만 둔다. 재시작하면 사라지지만
    // "재시작하면 어차피 캐시도 새로 채워지는" 상황과 의미가 맞아떨어져 굳이 DB에 남기지 않는다.
    private final Map<String, LocalDateTime> lastSyncedAt = new ConcurrentHashMap<>();

    // 대상 정의는 이 목록 하나에만 있다 — 캐시가 늘어나면 여기에 한 줄 추가하면 API/화면이 함께 갱신된다.
    private List<TargetDef> definitions() {
        return List.of(
                new TargetDef("mileageSniperTarget", "마일리지 저격", "마일리지 저격 대상 카드 목록",
                        false, mileageService::getSniperTargets),
                new TargetDef("playerCard", "선수 백과사전", "선수 카드(이름/포지션/부포지션 등) 전량",
                        // 11,668건 — 다른 대상보다 다시 채우는 데 시간이 더 걸릴 수 있다는 힌트만 준다.
                        // DB 조회 자체는 인덱스 탄 단건 SELECT라 실제로는 수백ms대라 서버를 막지는 않는다.
                        true, playerCardService::getAll),
                new TargetDef("playerSkill", "선수 스킬표", "타자/투수 스킬표",
                        false, this::refillPlayerSkill),
                new TargetDef("legendStat", "레전드 능력치", "레전드 능력치 + 구종",
                        // legendStat과 legendPitchType은 같은 화면(레전드 카드 상세)에서 같이 쓰인다 —
                        // 하나만 비우면 능력치는 새 값, 구종은 옛 값처럼 화면이 어긋나 함께 묶는다.
                        false, this::refillLegendStat),
                new TargetDef("historyRound", "히스토리 모드", "히스토리 모드 라운드 + 로스터",
                        false, funHistoryModeService::getAllRounds),
                new TargetDef("quiz", "퀴즈", "퀴즈 목록(어드민/최신 노출)",
                        false, this::refillQuiz),
                new TargetDef("events", "이벤트", "외부 이벤트 목록(어드민/공개)",
                        false, this::refillEvents),
                new TargetDef("coupons", "쿠폰", "쿠폰 목록(어드민/공개)",
                        false, this::refillCoupons),
                // notice(admin/public) + noticeDetail(건별)은 같은 화면 짝이라 함께 비운다.
                // noticeDetail은 공지 id별로 키가 갈려 전량 재조회가 비효율적이라 비우기만 하고,
                // 상세는 다음 조회 때 그때그때 다시 채운다(건당 단건 조회라 비용이 작다).
                new TargetDef("notice", "공지사항", "공지 목록 + 상세",
                        false, this::refillNotice)
        );
    }

    @Override
    public List<CacheSyncTargetResponse> getTargets() {
        return definitions().stream()
                .map(d -> new CacheSyncTargetResponse(
                        d.id, d.label, d.description, d.heavy, lastSyncedAt.get(d.id)))
                .toList();
    }

    @Override
    public CacheSyncResultResponse sync(String targetId) {
        TargetDef target = findTarget(targetId);
        return doSync(target);
    }

    @Override
    public List<CacheSyncResultResponse> syncAll() {
        // 하나가 실패해도 나머지는 계속 — 부분 실패를 각 결과에 담아 어중간한 상태를 그대로 보여준다.
        return definitions().stream()
                .map(this::doSync)
                .toList();
    }

    // 사용자가 보낸 문자열을 그대로 캐시 이름으로 쓰지 않는다 — 서버가 아는 목록(definitions) 안에서만 찾는다.
    private TargetDef findTarget(String targetId) {
        return definitions().stream()
                .filter(d -> d.id.equals(targetId))
                .findFirst()
                .orElseThrow(() -> new BaseException(
                        CacheSyncMessages.CACHE_SYNC_TARGET_NOT_FOUND, HttpStatus.BAD_REQUEST));
    }

    private CacheSyncResultResponse doSync(TargetDef target) {
        long start = System.nanoTime();
        // 비우기만 하면 다음 사용자가 그 비용을 문다 — evict 후 바로 조회 메서드를 호출해 캐시를 다시 채운다.
        // 이 조회 메서드는 다른 빈(서비스)의 @Cacheable 메서드라 자기호출 문제(AOP 우회) 없이 정상적으로 캐시에 올라간다.
        evictAll(target.cacheNames());
        try {
            target.refill().run();
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;
            LocalDateTime now = LocalDateTime.now();
            lastSyncedAt.put(target.id, now);
            return new CacheSyncResultResponse(target.id, target.label, true, elapsedMs, now, null);
        } catch (Exception e) {
            // 캐시는 이미 비워진 상태로 남는다 — 옛 값을 계속 보여주는 것보다 다음 요청이 새로 채우는 편이 안전하다.
            log.warn("캐시 동기화 실패: {}", target.id, e);
            long elapsedMs = (System.nanoTime() - start) / 1_000_000;
            return new CacheSyncResultResponse(target.id, target.label, false, elapsedMs, LocalDateTime.now(),
                    "다시 채우기 실패 — 캐시는 비워진 상태입니다. 다음 조회 시 자동으로 다시 채워집니다.");
        }
    }

    private void evictAll(List<String> cacheNames) {
        for (String cacheName : cacheNames) {
            Cache cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
            }
        }
    }

    private void refillPlayerSkill() {
        playerSkillService.getHitterSkills();
        playerSkillService.getPitcherSkills();
    }

    private void refillLegendStat() {
        funLegendStatService.getAll();
        funLegendStatService.getPitchTypes();
    }

    private void refillQuiz() {
        quizAdminService.getAll();
        try {
            quizUserService.getLatest();
        } catch (BaseException e) {
            // 노출 중인 최신 퀴즈가 없는 정상 상태 — 실패로 취급하지 않는다.
            if (e.getCode() != QuizMessages.QUIZ_LATEST_NOT_FOUND) {
                throw e;
            }
        }
    }

    private void refillEvents() {
        eventAdminService.getExternalEventList();
        eventUserService.getExternalEventList();
    }

    private void refillCoupons() {
        adminCouponService.getCouponLists();
        couponUserService.getCouponLists();
    }

    private void refillNotice() {
        // notice 캐시는 'public' 키만 실제로 채워진다(어드민 목록은 캐시 없이 항상 DB 직접 조회라 채울 대상이 없다).
        noticeService.getNoticeList();
    }

    private record TargetDef(
            String id, String label, String description, boolean heavy, Runnable refill
    ) {
        List<String> cacheNames() {
            return switch (id) {
                case "mileageSniperTarget" -> List.of("mileageSniperTarget");
                case "playerCard" -> List.of("playerCard");
                case "playerSkill" -> List.of("playerSkill");
                case "legendStat" -> List.of("legendStat", "legendPitchType");
                case "historyRound" -> List.of("historyRound");
                case "quiz" -> List.of("quiz");
                case "events" -> List.of("events");
                case "coupons" -> List.of("coupons");
                case "notice" -> List.of("notice", "noticeDetail");
                default -> List.of();
            };
        }
    }
}
