package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.config.properties.CafeSyncProperties;
import com.dawne.com2usbaseball.domain.admin.service.UploadService;
import com.dawne.com2usbaseball.domain.coupon.service.CouponCollectService;
import com.dawne.com2usbaseball.domain.event.dto.mapstruct.EventMapStruct;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.repository.EventRepository;
import com.dawne.com2usbaseball.domain.event.service.support.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** 가짜 카페 클라이언트로 수집 흐름(초안 저장·쿠폰 등록·원문 변경 표시)을 검증한다. */
class CafeSyncServiceImplTest {

    private static final String KEY = "GM-KEY";
    private CafeSyncProperties props;
    private EventRepository repo;
    private EventCollectService collect;
    private CouponCollectService coupons;
    private UploadService upload;

    @BeforeEach
    void setUp() {
        props = new CafeSyncProperties();
        props.setMemberKey(KEY);
        props.setRequestDelayMs(0);
        repo = mock(EventRepository.class);
        collect = mock(EventCollectService.class);
        coupons = mock(CouponCollectService.class);
        upload = mock(UploadService.class);
        when(repo.findTrackedCollectedEvents()).thenReturn(List.of());
        when(repo.findExistingSourceArticleIds(any())).thenReturn(List.of());
    }

    private CafeSyncServiceImpl service(CafeClient client) {
        return new CafeSyncServiceImpl(client, props, repo, collect, coupons, upload, mock(EventMapStruct.class));
    }

    private static String bodyHtml(String extra) {
        return "<div class=\"se-component se-text\"><div class=\"se-component-content\">"
                + "<p class=\"se-text-paragraph\">이벤트 기간 : 잠깐</p></div></div>"
                + "<div class=\"se-component se-text\"><div class=\"se-component-content\">"
                + "<p class=\"se-text-paragraph\">" + extra + "</p></div></div>"
                + "<div class=\"se-component se-text\"><div class=\"se-component-content\">"
                + "<p class=\"se-text-paragraph\">감사합니다</p></div></div>";
    }

    private static CafeClient client(CafeArticleSummary summary, String html) {
        return new CafeClient() {
            public List<CafeArticleSummary> fetchList() { return List.of(summary); }
            public CafeArticle fetchArticle(long id) { return new CafeArticle(id, summary.subject(), KEY, summary.writtenAt(), html); }
            public Optional<byte[]> fetchImage(String url) { return Optional.empty(); }
        };
    }

    @Test
    @DisplayName("새 이벤트 글은 비공개 초안으로 저장한다")
    void 새_글_초안_저장() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        LocalDateTime end = now.plusDays(3);
        String subject = "[이벤트] 테스트 이벤트 (~" + end.getMonthValue() + "/" + end.getDayOfMonth() + " 23:59)";
        var summary = new CafeArticleSummary(100L, subject, KEY, now.minusHours(1));

        CafeSyncResult r = service(client(summary, bodyHtml("보상 안내"))).syncNow();

        assertThat(r.created()).isEqualTo(1);
        ArgumentCaptor<EventEntity> cap = ArgumentCaptor.forClass(EventEntity.class);
        verify(collect).saveDraft(cap.capture());
        EventEntity e = cap.getValue();
        assertThat(e.isVisible()).isFalse();
        assertThat(e.getSourceArticleId()).isEqualTo(100L);
        assertThat(e.getTitle()).isEqualTo("테스트");
        assertThat(e.getContentHtml()).contains("보상 안내");
        assertThat(e.getExternalLink()).endsWith("/100");
        assertThat(CafeSyncRules.isSourceChanged(e)).isFalse();
    }

    @Test
    @DisplayName("이미 지난 이벤트와 다른 작성자 글은 초안으로 만들지 않는다")
    void 지난_글_건너뜀() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        var old = new CafeArticleSummary(1L, "[이벤트] 옛 이벤트 (~2020/1/1 23:59)", KEY, now.minusDays(1));
        assertThat(service(client(old, bodyHtml("x"))).syncNow().created()).isZero();

        var other = new CafeArticleSummary(2L, "[이벤트] 남의 글 (~2099/1/1)", "OTHER", now);
        assertThat(service(client(other, bodyHtml("x"))).syncNow().created()).isZero();
        verify(collect, never()).saveDraft(any());
    }

    @Test
    @DisplayName("진행 중 수집 이벤트의 원문이 바뀌면 본문은 두고 변경 표시만 한다")
    void 원문_변경_감지() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        String oldHtml = "<p>이벤트 기간 : 잠깐</p>\n<p>보상 안내</p>";
        EventEntity tracked = EventEntity.builder().id(7L).sourceArticleId(100L).contentHtml(oldHtml)
                .contentHash(CafeArticleParser.contentHash(oldHtml)).expireAt(now.plusDays(2)).build();
        when(repo.findTrackedCollectedEvents()).thenReturn(List.of(tracked));
        var summary = new CafeArticleSummary(100L, "[이벤트] 테스트 (~2099/1/1)", KEY, now.minusDays(1));
        when(repo.findExistingSourceArticleIds(any())).thenReturn(List.of(100L));

        CafeSyncResult r = service(client(summary, bodyHtml("보상이 바뀜"))).syncNow();

        assertThat(r.updated()).isEqualTo(1);
        verify(collect).markSourceChanged(eq(7L), anyString());
        verify(collect, never()).applyContent(any(), any(), any(), any());
    }

    @Test
    @DisplayName("쿠폰 표가 있는 글은 발행된 번호만 바로 공개로 등록한다")
    void 쿠폰_등록() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        LocalDateTime end = now.plusDays(5);
        String date = end.getMonthValue() + "/" + end.getDayOfMonth();
        String table = "<div class=\"se-component se-table\"><table><tr><td>쿠폰명</td><td>쿠폰 번호</td><td>쿠폰 보상</td><td>사용 가능 기한</td></tr>"
                + "<tr><td>A 쿠폰</td><td>ABCD1234</td><td>스타 x1</td><td>~ " + date + "</td></tr>"
                + "<tr><td>B 쿠폰</td><td>공개 예정</td><td>스타 x1</td><td>~ " + date + "</td></tr></table></div>";
        var summary = new CafeArticleSummary(5L, "[쿠폰] 쿠폰 안내", KEY, now.minusHours(2));
        when(coupons.registerCollected(any())).thenReturn(1);

        CafeSyncResult r = service(client(summary, table)).syncNow();

        assertThat(r.coupons()).isEqualTo(1);
        verify(coupons).registerCollected(argThat(l -> l.size() == 1 && l.get(0).couponCode().equals("ABCD1234")));
    }

    private static String couponTable(LocalDateTime now) {
        LocalDateTime end = now.plusDays(5);
        String date = end.getMonthValue() + "/" + end.getDayOfMonth();
        return "<div class=\"se-component se-table\"><table><tr><td>쿠폰명</td><td>쿠폰 번호</td><td>쿠폰 보상</td><td>사용 가능 기한</td></tr>"
                + "<tr><td>A 쿠폰</td><td>ABCD1234</td><td>스타 x1</td><td>~ " + date + "</td></tr></table></div>";
    }

    private static String eventSubject(LocalDateTime now, String name) {
        LocalDateTime end = now.plusDays(3);
        return "[이벤트] " + name + " (~" + end.getMonthValue() + "/" + end.getDayOfMonth() + " 23:59)";
    }

    @Test
    @DisplayName("본문 구간을 못 찾으면 행을 만들지 않고 쿠폰은 등록한다")
    void 구간_못_찾음_행_없음() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        var summary = new CafeArticleSummary(200L, eventSubject(now, "쿠폰 이벤트"), KEY, now.minusHours(1));
        when(coupons.registerCollected(any())).thenReturn(1);

        CafeSyncResult r = service(client(summary, couponTable(now))).syncNow();

        assertThat(r.created()).isZero();
        assertThat(r.skipped()).isEqualTo(1);
        assertThat(r.coupons()).isEqualTo(1);
        verify(collect, never()).saveDraft(any());
        verify(collect, never()).mergeCollected(any(), anyLong(), any(), any(), any());
    }

    @Test
    @DisplayName("마감을 확인하지 못하면 행을 만들지 않는다")
    void 마감_미확인_행_없음() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        var summary = new CafeArticleSummary(201L, "[이벤트] 마감 모름", KEY, now.minusHours(1));

        CafeSyncResult r = service(client(summary, bodyHtml("보상 안내"))).syncNow();

        assertThat(r.created()).isZero();
        assertThat(r.skipped()).isEqualTo(1);
        verify(collect, never()).saveDraft(any());
    }

    @Test
    @DisplayName("주소가 글번호로 끝나는 수동 행에는 새 행 대신 병합한다")
    void 링크로_병합() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        var manual = EventEntity.builder().id(9L).title("전혀 다른 제목").imageUrl("https://img/x.png")
                .externalLink("https://cafe.naver.com/f-e/cafes/28/articles/300?boardtype=L").build();
        when(repo.findManualEventCandidates()).thenReturn(List.of(manual));
        var summary = new CafeArticleSummary(300L, eventSubject(now, "링크 이벤트"), KEY, now.minusHours(1));

        CafeSyncResult r = service(client(summary, bodyHtml("보상 안내"))).syncNow();

        assertThat(r.updated()).isEqualTo(1);
        assertThat(r.created()).isZero();
        verify(collect, never()).saveDraft(any());
        verify(collect).mergeCollected(eq(9L), eq(300L), contains("보상 안내"), anyString(), isNull());
    }

    @Test
    @DisplayName("이름이 정규화 후 같으면 병합하고 id 가 큰 행을 고른다 (수동 값은 그대로)")
    void 이름으로_병합() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        var older = EventEntity.builder().id(3L).title("포스트시즌 트로피 제작 이벤트").imageUrl("").build();
        var newer = EventEntity.builder().id(5L).title("포스트시즌 트로피 제작 이벤트").imageUrl("").visible(true).build();
        when(repo.findManualEventCandidates()).thenReturn(List.of(newer, older));
        var summary = new CafeArticleSummary(301L, eventSubject(now, "포스트시즌 트로피 제작"), KEY, now.minusHours(1));

        CafeSyncResult r = service(client(summary, bodyHtml("보상 안내"))).syncNow();

        assertThat(r.updated()).isEqualTo(1);
        verify(collect).mergeCollected(eq(5L), eq(301L), anyString(), anyString(), any());
        verify(collect, never()).saveDraft(any());
        // 제목·노출·기간은 병합 API 가 받지도 않는다 — 수동 행 객체도 그대로
        assertThat(newer.getTitle()).isEqualTo("포스트시즌 트로피 제작 이벤트");
        assertThat(newer.isVisible()).isTrue();
    }

    @Test
    @DisplayName("행 없는 쿠폰 글은 45일 안이면 다시 읽고, 밖이면 건너뛴다")
    void 쿠폰_글_45일_창() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        when(coupons.registerCollected(any())).thenReturn(1);

        var inside = new CafeArticleSummary(400L, "[쿠폰] 안내", KEY, now.minusDays(30));
        CafeSyncResult in = service(client(inside, couponTable(now))).syncNow();
        assertThat(in.coupons()).isEqualTo(1);
        verify(coupons, times(1)).registerCollected(any());

        var outside = new CafeArticleSummary(401L, "[쿠폰] 안내", KEY, now.minusDays(46));
        CafeSyncResult out = service(client(outside, couponTable(now))).syncNow();
        assertThat(out.skipped()).isEqualTo(1);
        assertThat(out.coupons()).isZero();
        verify(coupons, times(1)).registerCollected(any());
    }

    @Test
    @DisplayName("이름 정규화: 머리말·공백·기호·끝의 이벤트를 뺀다")
    void 이름_정규화() {
        assertThat(CafeSyncRules.normalizeEventName("[이벤트] 포스트시즌 트로피 제작 이벤트"))
                .isEqualTo(CafeSyncRules.normalizeEventName("포스트시즌 트로피 제작"))
                .isEqualTo("포스트시즌트로피제작");
        assertThat(CafeSyncRules.normalizeEventName("🎉 Hello, 월드!! 이벤트 ")).isEqualTo("Hello월드");
        assertThat(CafeSyncRules.normalizeEventName(null)).isEmpty();
        assertThat(CafeSyncRules.normalizeEventName("[이벤트] 이벤트")).isEmpty();
    }

    @Test
    @DisplayName("주소 끝 숫자가 글번호인지 판정한다")
    void 링크_글번호_판정() {
        assertThat(CafeSyncRules.linkEndsWithArticleId("https://cafe.naver.com/com2usbaseball2015/2016389", 2016389L)).isTrue();
        assertThat(CafeSyncRules.linkEndsWithArticleId("https://cafe.naver.com/f-e/cafes/28/articles/2016389?boardtype=L", 2016389L)).isTrue();
        assertThat(CafeSyncRules.linkEndsWithArticleId("https://cafe.naver.com/x/12016389", 2016389L)).isFalse();
        assertThat(CafeSyncRules.linkEndsWithArticleId(null, 1L)).isFalse();
    }

    @Test
    @DisplayName("쿠폰 표가 있는 이벤트 글은 행 없이 쿠폰만 등록한다")
    void 쿠폰_표_이벤트_글_행_없음() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        var summary = new CafeArticleSummary(500L, eventSubject(now, "출석 보상"), KEY, now.minusHours(1));
        when(coupons.registerCollected(any())).thenReturn(1);

        CafeSyncResult r = service(client(summary, bodyHtml("보상") + couponTable(now))).syncNow();

        assertThat(r.created()).isZero();
        assertThat(r.skipped()).isEqualTo(1);
        assertThat(r.coupons()).isEqualTo(1);
        verify(collect, never()).saveDraft(any());
        verify(collect, never()).mergeCollected(any(), anyLong(), any(), any(), any());
    }

    @Test
    @DisplayName("제목에 쿠폰이 들어간 이벤트 글은 표가 없어도 행을 만들지 않는다")
    void 제목_쿠폰_행_없음() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
        var summary = new CafeArticleSummary(501L, eventSubject(now, "국제대회 쿠폰 이벤트"), KEY, now.minusHours(1));

        CafeSyncResult r = service(client(summary, bodyHtml("보상"))).syncNow();

        assertThat(r.created()).isZero();
        assertThat(r.skipped()).isEqualTo(1);
        verify(collect, never()).saveDraft(any());
    }
}
