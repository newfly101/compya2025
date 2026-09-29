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
}
