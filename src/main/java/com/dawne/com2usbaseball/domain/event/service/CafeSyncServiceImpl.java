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
import java.util.ArrayList;
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
    /**
     * 쿠폰 글은 site_events 행이 남지 않고, 쿠폰 번호는 글 올라온 뒤 나중에 공개되기도 한다.
     * 그래서 행 없는 글은 작성일이 이 기간 안이면 매 실행 상세를 다시 읽어 쿠폰만 등록한다 (중복은 coupon_code UNIQUE 가 무시).
     */
    private static final int RECHECK_LOOKBACK_DAYS = 45;

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

        List<EventEntity> manualPool = new ArrayList<>(); // 수동 등록 행 후보 — 필요할 때 한 번만 읽는다
        boolean[] manualLoaded = {false};
        for (CafeArticleSummary a : mine) {
            if (existing.contains(a.articleId())) continue;
            try {
                if (!manualLoaded[0] && CafeArticleParser.isEventSubject(a.subject())) {
                    manualPool.addAll(eventRepository.findManualEventCandidates());
                    manualLoaded[0] = true;
                }
                collectNew(a, now, c, manualPool);
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

    private void collectNew(CafeArticleSummary a, LocalDateTime now, Counter c, List<EventEntity> manualPool) {
        boolean eventSubject = CafeArticleParser.isEventSubject(a.subject());
        if (!eventSubject && (a.writtenAt() == null || a.writtenAt().isBefore(now.minusDays(RECHECK_LOOKBACK_DAYS)))) {
            c.skipped++; // 이벤트도 아니고 조회 기간 밖의 글 — 다시 읽지 않는다
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
        // 쿠폰 글(표가 있거나 제목에 "쿠폰")은 이벤트 행으로 만들지도 병합하지도 않는다 — 쿠폰으로만 등록하고 45일 재조회로 번호를 계속 잡는다
        String plainName = title.name().isBlank() ? a.subject() : title.name();
        if ((plainName != null && plainName.contains("쿠폰"))
                || !CafeArticleParser.extractCoupons(art.contentHtml(), now).isEmpty()) {
            c.skipped++;
            return;
        }

        CafeBody body = CafeArticleParser.extractBody(art.contentHtml(), a.writtenAt());
        if (!body.found()) {
            c.skipped++; // 본문 구간을 못 찾으면 행을 만들지 않는다 (쿠폰은 위에서 이미 등록)
            return;
        }
        LocalDateTime expire = title.expireAt() != null ? title.expireAt()
                : body.periodEnd() != null ? body.periodEnd() : CafeSyncRules.UNCONFIRMED_EXPIRE;
        if (CafeSyncRules.UNCONFIRMED_EXPIRE.equals(expire)) {
            c.skipped++; // 마감을 확인하지 못하면 행을 만들지 않는다 — 다음 실행에서 다시 본다
            return;
        }
        if (expire.isBefore(now)) {
            c.skipped++;
            return;
        }
        LocalDateTime start = body.periodStart() != null ? body.periodStart()
                : a.writtenAt() != null ? a.writtenAt() : now;
        if (!expire.isAfter(start)) {
            start = expire.minusDays(1); // DB 제약(expire > start) 보호
        }

        String name = title.name().isBlank() ? a.subject() : title.name();
        EventEntity manual = findManualMatch(manualPool, a.articleId(), name);
        if (manual != null) {
            mergeIntoManual(manual, a, body, now);
            manualPool.remove(manual);
            c.updated++;
            return;
        }

        UploadedHtml uploaded = withS3Images(body, a.articleId());
        if (uploaded.failed() > 0) {
            log.warn("[CAFE-SYNC] 초안 이미지 업로드 실패 {}건 articleId={} — 관리자 '본문 갱신' 으로 다시 시도", uploaded.failed(), a.articleId());
        }
        String contentHtml = uploaded.html();
        String hash = CafeArticleParser.contentHash(contentHtml);
        String banner = uploadBanner(body.bannerImage(), a.articleId());

        EventEntity draft = EventEntity.builder()
                .eventType(EventType.OFFICIAL)
                .title(cut(name, 255))
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

    // ---------------- 수동 등록분 병합 ----------------

    /** 관리자가 손으로 등록한 행 중 이 글과 짝인 것 — 주소가 글번호로 끝나거나 이름이 같다. 여러 개면 id 가 큰 쪽 */
    private static EventEntity findManualMatch(List<EventEntity> pool, long articleId, String collectedName) {
        String wanted = CafeSyncRules.normalizeEventName(collectedName);
        return pool.stream()
                .filter(m -> CafeSyncRules.linkEndsWithArticleId(m.getExternalLink(), articleId)
                        || (!wanted.isEmpty() && wanted.equals(CafeSyncRules.normalizeEventName(m.getTitle()))))
                .max(Comparator.comparing(EventEntity::getId))
                .orElse(null);
    }

    /** 제목·기간·노출·링크는 수동 값을 두고 본문·해시·글번호(·비어 있을 때만 배너)를 채운다 */
    private void mergeIntoManual(EventEntity manual, CafeArticleSummary a, CafeBody body, LocalDateTime now) {
        UploadedHtml uploaded = withS3Images(body, a.articleId());
        if (uploaded.failed() > 0) {
            log.warn("[CAFE-SYNC] 병합 이미지 업로드 실패 {}건 articleId={} eventId={} — 관리자 '본문 갱신' 으로 다시 시도", uploaded.failed(), a.articleId(), manual.getId());
        }
        String banner = manual.getImageUrl() == null || manual.getImageUrl().isBlank()
                ? uploadBanner(body.bannerImage(), a.articleId()) : null;
        collectService.mergeCollected(manual.getId(), a.articleId(), uploaded.html(),
                CafeArticleParser.contentHash(uploaded.html()), banner);
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
        // 전부 아니면 전무 — 이미지 한 장이라도 S3 에 못 올리면 저장하지 않는다.
        // 반쪽 결과(카페 주소가 남은 이미지는 우리 도메인에서 403 으로 깨진다)로 기존 본문을 덮지 않기 위해서다.
        UploadedHtml uploaded = withS3Images(body, e.getSourceArticleId());
        String banner = null;
        if (e.getImageUrl() == null || e.getImageUrl().isBlank()) {
            banner = uploadBanner(body.bannerImage(), e.getSourceArticleId());
            if (banner == null && body.bannerImage() != null) uploaded = uploaded.withFailure();
        }
        if (uploaded.failed() > 0) {
            log.error("[CAFE-SYNC] 본문 갱신 중단 eventId={} — 이미지 업로드 실패 {}건, 기존 본문·이미지 유지", id, uploaded.failed());
            throw new BaseException(EventMessages.EVENT_CAFE_IMAGE_UPLOAD_FAILED, HttpStatus.BAD_GATEWAY);
        }
        String html = uploaded.html();
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

    /** 본문 이미지를 S3 로 옮긴 결과 — failed 는 올리지 못한 이미지 수(그 이미지는 카페 주소가 남는다) */
    private record UploadedHtml(String html, int failed) {
        UploadedHtml withFailure() {
            return new UploadedHtml(html, failed + 1);
        }
    }

    private UploadedHtml withS3Images(CafeBody body, long articleId) {
        Map<String, String> replaced = new LinkedHashMap<>();
        int failed = 0;
        for (String src : body.images()) {
            if (replaced.containsKey(src)) continue;
            String url = uploadImage(src, articleId);
            if (url != null) replaced.put(src, url);
            else failed++;
        }
        return new UploadedHtml(CafeArticleParser.rewriteImages(body.html(), replaced), failed);
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
