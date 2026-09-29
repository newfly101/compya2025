package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.config.properties.CafeSyncProperties;
import com.dawne.com2usbaseball.domain.admin.service.UploadService;
import com.dawne.com2usbaseball.domain.coupon.dto.request.CollectedCouponCommand;
import com.dawne.com2usbaseball.domain.coupon.service.CouponCollectService;
import com.dawne.com2usbaseball.domain.event.dto.mapstruct.EventMapStruct;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import com.dawne.com2usbaseball.domain.event.enums.EventType;
import com.dawne.com2usbaseball.domain.event.repository.EventRepository;
import com.dawne.com2usbaseball.domain.event.service.support.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Supplier;

/**
 * 공식 카페 이벤트·쿠폰 자동 수집 (ADR 0009). 매일 11:01(KST) + 관리자 수동 실행이 같은 코드를 부른다.
 * 네트워크 호출이 길어 이 클래스에는 트랜잭션을 걸지 않는다 — DB 반영은 EventCollectService 가 건별로 한다.
 * 서버 1대 가정: 동시 실행 방지는 프로세스 안 AtomicBoolean 이다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CafeSyncServiceImpl implements CafeSyncService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    /** [이벤트]가 아닌 글(쿠폰 글 등)은 새 글일 때만 보므로, 이 기간 안에 올라온 글만 쿠폰 표를 확인한다 */
    private static final int NON_EVENT_LOOKBACK_DAYS = 2;

    private final CafeClient client;
    private final CafeSyncProperties props;
    private final EventRepository eventRepository;
    private final EventCollectService collectService;
    private final CouponCollectService couponCollectService;
    private final UploadService uploadService;
    private final EventMapStruct eventMapStruct;

    private final AtomicBoolean running = new AtomicBoolean(false);

    @Scheduled(cron = "0 1 11 * * *", zone = "Asia/Seoul")
    public void runDaily() {
        if (!props.isEnabled()) {
            return;
        }
        try {
            CafeSyncResult r = syncNow();
            log.info("[CAFE-SYNC] 일일 수집 완료 {}", r);
        } catch (Exception e) {
            // 배치 실패가 서비스에 영향을 주면 안 된다 — 로그만 남기고 다음 날 다시 시도한다
            log.error("[CAFE-SYNC] 일일 수집 실패: {}", e.getMessage(), e);
        }
    }

    @Override
    public CafeSyncResult syncNow() {
        if (!running.compareAndSet(false, true)) {
            throw new BaseException(EventMessages.EVENT_CAFE_SYNC_RUNNING, HttpStatus.CONFLICT);
        }
        try {
            return doSync();
        } finally {
            running.set(false);
        }
    }

    private CafeSyncResult doSync() {
        LocalDateTime now = LocalDateTime.now(KST);
        Counter c = new Counter();

        List<CafeArticleSummary> list;
        try {
            list = withRetry(client::fetchList);
        } catch (Exception e) {
            log.error("[CAFE-SYNC] 목록 가져오기 실패: {}", e.getMessage(), e);
            throw new BaseException(EventMessages.EVENT_CAFE_FETCH_FAILED, HttpStatus.BAD_GATEWAY);
        }
        List<CafeArticleSummary> mine = list.stream()
                .filter(a -> props.getMemberKey().equals(a.memberKey()))
                .filter(a -> a.subject() == null || !a.subject().contains("모아보기"))
                .sorted(Comparator.comparingLong(CafeArticleSummary::articleId))
                .toList();

        // 재확인 대상은 새 초안을 만들기 전에 뽑는다 (방금 만든 글을 또 읽지 않도록)
        List<EventEntity> tracked = eventRepository.findTrackedCollectedEvents();
        Set<Long> existing = new HashSet<>(eventRepository.findExistingSourceArticleIds(
                mine.stream().map(CafeArticleSummary::articleId).toList()));

        for (CafeArticleSummary a : mine) {
            if (existing.contains(a.articleId())) continue;
            try {
                collectNew(a, now, c);
            } catch (Exception e) {
                c.failed++;
                log.error("[CAFE-SYNC] 새 글 처리 실패 articleId={}: {}", a.articleId(), e.getMessage(), e);
            }
        }
        for (EventEntity e : tracked) {
            try {
                recheck(e, now, c);
            } catch (Exception ex) {
                c.failed++;
                log.error("[CAFE-SYNC] 재확인 실패 eventId={} articleId={}: {}", e.getId(), e.getSourceArticleId(), ex.getMessage(), ex);
            }
        }
        return new CafeSyncResult(c.created, c.updated, c.failed, c.skipped, c.coupons);
    }

    // ---------------- 새 글 ----------------

    private void collectNew(CafeArticleSummary a, LocalDateTime now, Counter c) {
        boolean eventSubject = CafeArticleParser.isEventSubject(a.subject());
        if (!eventSubject && (a.writtenAt() == null || a.writtenAt().isBefore(now.minusDays(NON_EVENT_LOOKBACK_DAYS)))) {
            c.skipped++; // 이벤트도 아니고 새 글도 아님 — 다시 읽지 않는다
            return;
        }
        CafeTitle title = CafeArticleParser.parseTitle(a.subject(), a.writtenAt());
        if (eventSubject && title.expireAt() != null && title.expireAt().isBefore(now)) {
            c.skipped++; // 이미 끝난 이벤트는 초안으로 만들지 않는다
            return;
        }
        CafeArticle art = fetchWithDelay(a.articleId());
        c.coupons += registerCoupons(art.contentHtml(), now);
        if (!eventSubject) return;

        CafeBody body = CafeArticleParser.extractBody(art.contentHtml(), a.writtenAt());
        LocalDateTime expire = title.expireAt() != null ? title.expireAt()
                : body.periodEnd() != null ? body.periodEnd() : CafeSyncRules.UNCONFIRMED_EXPIRE;
        if (!CafeSyncRules.UNCONFIRMED_EXPIRE.equals(expire) && expire.isBefore(now)) {
            c.skipped++;
            return;
        }
        LocalDateTime start = body.periodStart() != null ? body.periodStart()
                : a.writtenAt() != null ? a.writtenAt() : now;
        if (!expire.isAfter(start)) {
            start = expire.minusDays(1); // DB 제약(expire > start) 보호
        }

        String contentHtml = null;
        String hash = null;
        if (body.found()) {
            contentHtml = withS3Images(body, a.articleId());
            hash = CafeArticleParser.contentHash(contentHtml);
        }
        String banner = uploadBanner(body.bannerImage(), a.articleId());

        EventEntity draft = EventEntity.builder()
                .eventType(EventType.OFFICIAL)
                .title(cut(title.name().isBlank() ? a.subject() : title.name(), 255))
                .startAt(start)
                .expireAt(expire)
                .imageUrl(banner != null ? banner : "")
                .externalLink(articleUrl(a.articleId()))
                .visible(false) // 초안 — 관리자가 노출을 켜야 공개
                .sourceArticleId(a.articleId())
                .contentHtml(contentHtml)
                .contentHash(hash)
                .syncedAt(now)
                .build();
        collectService.saveDraft(draft);
        c.created++;
    }

    // ---------------- 진행 중 수집 이벤트 재확인 ----------------

    private void recheck(EventEntity e, LocalDateTime now, Counter c) {
        CafeArticle art = fetchWithDelay(e.getSourceArticleId());
        c.coupons += registerCoupons(art.contentHtml(), now);
        if (e.getContentHtml() == null) return; // 본문 없는 초안은 해시 비교 대상이 아님
        CafeBody body = CafeArticleParser.extractBody(art.contentHtml(), art.writtenAt());
        if (!body.found()) return;
        String newHash = CafeArticleParser.contentHash(body.html());
        if (!newHash.equals(e.getContentHash())) {
            collectService.markSourceChanged(e.getId(), newHash); // 자동으로 덮지 않고 표시만
            c.updated++;
        }
    }

    // ---------------- 본문 갱신 ----------------

    @Override
    public EventResponse refreshEvent(Long id) {
        EventEntity e = eventRepository.findById(id)
                .orElseThrow(() -> new BaseException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));
        if (e.getSourceArticleId() == null) {
            throw new BaseException(EventMessages.EVENT_NOT_COLLECTED, HttpStatus.BAD_REQUEST);
        }
        CafeArticle art;
        try {
            art = withRetry(() -> client.fetchArticle(e.getSourceArticleId()));
        } catch (Exception ex) {
            log.error("[CAFE-SYNC] 본문 갱신 실패 eventId={}: {}", id, ex.getMessage(), ex);
            throw new BaseException(EventMessages.EVENT_CAFE_FETCH_FAILED, HttpStatus.BAD_GATEWAY);
        }
        CafeBody body = CafeArticleParser.extractBody(art.contentHtml(), art.writtenAt());
        if (!body.found()) {
            throw new BaseException(EventMessages.EVENT_CAFE_BODY_NOT_FOUND, HttpStatus.UNPROCESSABLE_ENTITY);
        }
        String html = withS3Images(body, e.getSourceArticleId());
        String banner = e.getImageUrl() == null || e.getImageUrl().isBlank()
                ? uploadBanner(body.bannerImage(), e.getSourceArticleId()) : null;
        collectService.applyContent(id, html, CafeArticleParser.contentHash(html), banner);
        EventEntity fresh = eventRepository.findById(id)
                .orElseThrow(() -> new BaseException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));
        return eventMapStruct.toResponse(fresh);
    }

    // ---------------- 쿠폰 ----------------

    private int registerCoupons(String contentHtml, LocalDateTime now) {
        List<CollectedCouponCommand> cmds = CafeArticleParser.extractCoupons(contentHtml, now).stream()
                .filter(r -> r.registrable(now)) // 미발행·기한 지남·칸 수 어긋남은 건너뜀 (다음 배치에서 재확인)
                .map(r -> new CollectedCouponCommand(r.couponCode(), r.title(), r.detail(), r.expireAt()))
                .toList();
        return cmds.isEmpty() ? 0 : couponCollectService.registerCollected(cmds);
    }

    // ---------------- 이미지 ----------------

    private String withS3Images(CafeBody body, long articleId) {
        Map<String, String> replaced = new LinkedHashMap<>();
        for (String src : body.images()) {
            if (replaced.containsKey(src)) continue;
            String url = uploadImage(src, articleId);
            if (url != null) replaced.put(src, url);
        }
        return CafeArticleParser.rewriteImages(body.html(), replaced);
    }

    private String uploadBanner(String src, long articleId) {
        return src == null ? null : uploadImage(src, articleId);
    }

    private String uploadImage(String src, long articleId) {
        return client.fetchImage(src).map(bytes -> uploadService.uploadCollectedImage(bytes, articleId)).orElse(null);
    }

    // ---------------- 공통 ----------------

    private CafeArticle fetchWithDelay(long articleId) {
        sleepQuietly(props.getRequestDelayMs());
        return withRetry(() -> client.fetchArticle(articleId));
    }

    /** 실패하면 1회만 다시 시도한다 (ADR 0009 § 원문 변경·실패 처리) */
    private <T> T withRetry(Supplier<T> call) {
        try {
            return call.get();
        } catch (RuntimeException first) {
            log.warn("[CAFE-SYNC] 요청 실패, 1회 재시도: {}", first.getMessage());
            sleepQuietly(props.getRequestDelayMs());
            return call.get();
        }
    }

    private void sleepQuietly(long ms) {
        if (ms <= 0) return;
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }

    private String articleUrl(long articleId) {
        return "https://cafe.naver.com/" + props.getCafeUrl() + "/" + articleId;
    }

    private static String cut(String s, int max) {
        return s == null || s.length() <= max ? s : s.substring(0, max);
    }

    private static final class Counter {
        int created, updated, failed, skipped, coupons;
    }
}
