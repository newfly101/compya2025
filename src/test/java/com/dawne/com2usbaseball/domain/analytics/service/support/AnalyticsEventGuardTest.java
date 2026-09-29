package com.dawne.com2usbaseball.domain.analytics.service.support;

import com.dawne.com2usbaseball.domain.analytics.dto.request.AnalyticsEventItemRequest;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsEventType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * DB 없이 순수 로직만 검증한다 (봇 판별 / anonId 형식 / 길이 자르기).
 * 테이블이 아직 DB 에 없어 매퍼 테스트는 이번 단계에서 돌릴 수 없다.
 */
@DisplayName("사용자 행동 이벤트 수집 가드")
class AnalyticsEventGuardTest {

    @Test
    @DisplayName("정상 UUID v4 형식이면 통과한다")
    void 정상_UUID면_통과() {
        assertThat(AnalyticsEventGuard.isValidUuid("550e8400-e29b-41d4-a716-446655440000")).isTrue();
    }

    @Test
    @DisplayName("UUID 형식이 아니면 걸러진다")
    void UUID_형식이_아니면_걸러짐() {
        assertThat(AnalyticsEventGuard.isValidUuid("not-a-uuid")).isFalse();
        assertThat(AnalyticsEventGuard.isValidUuid("")).isFalse();
        assertThat(AnalyticsEventGuard.isValidUuid(null)).isFalse();
    }

    @Test
    @DisplayName("잘 알려진 크롤러 User-Agent 는 봇으로 판정한다")
    void 알려진_크롤러는_봇으로_판정() {
        assertThat(AnalyticsEventGuard.isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).isTrue();
        assertThat(AnalyticsEventGuard.isBot("Mozilla/5.0 (compatible; AhrefsBot/7.0)")).isTrue();
        assertThat(AnalyticsEventGuard.isBot("curl/8.1.2")).isTrue();
        assertThat(AnalyticsEventGuard.isBot("python-requests/2.31.0")).isTrue();
    }

    @Test
    @DisplayName("User-Agent 가 없으면 봇으로 취급한다")
    void UA_없으면_봇으로_취급() {
        assertThat(AnalyticsEventGuard.isBot(null)).isTrue();
        assertThat(AnalyticsEventGuard.isBot("")).isTrue();
        assertThat(AnalyticsEventGuard.isBot("   ")).isTrue();
    }

    @Test
    @DisplayName("일반 브라우저 User-Agent 는 봇이 아니다")
    void 일반_브라우저는_봇이_아님() {
        String chrome = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                + "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
        assertThat(AnalyticsEventGuard.isBot(chrome)).isFalse();
    }

    @Test
    @DisplayName("길이를 넘는 값은 잘라서 반환한다")
    void 길이_초과값은_잘림() {
        String longValue = "a".repeat(600);
        String truncated = AnalyticsEventGuard.truncate(longValue, AnalyticsEventGuard.TARGET_URL_MAX_LENGTH);

        assertThat(truncated).hasSize(AnalyticsEventGuard.TARGET_URL_MAX_LENGTH);
    }

    @Test
    @DisplayName("길이 안쪽 값은 그대로 둔다")
    void 길이_안쪽값은_그대로() {
        assertThat(AnalyticsEventGuard.truncate("short", 100)).isEqualTo("short");
    }

    @Test
    @DisplayName("null 값은 잘라내지 않고 null 그대로 반환한다")
    void null값은_그대로() {
        assertThat(AnalyticsEventGuard.truncate(null, 100)).isNull();
    }

    @Test
    @DisplayName("한 요청 최대 이벤트 수는 20건이다")
    void 최대_이벤트_수는_20() {
        assertThat(AnalyticsEventGuard.MAX_EVENTS_PER_REQUEST).isEqualTo(20);
    }

    @Test
    @DisplayName("UA 에서 OS 를 판별한다")
    void OS_판별() {
        assertThat(AnalyticsEventGuard.detectOs("Mozilla/5.0 (Linux; Android 14)")).isEqualTo("Android");
        assertThat(AnalyticsEventGuard.detectOs("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)")).isEqualTo("iOS");
        assertThat(AnalyticsEventGuard.detectOs("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).isEqualTo("Windows");
        assertThat(AnalyticsEventGuard.detectOs("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)")).isEqualTo("Mac");
        assertThat(AnalyticsEventGuard.detectOs("Mozilla/5.0 (X11; Linux x86_64)")).isEqualTo("Other");
        assertThat(AnalyticsEventGuard.detectOs(null)).isEqualTo("Other");
    }

    @Test
    @DisplayName("UA와 화면폭으로 기기 종류를 판별한다")
    void 기기종류_판별() {
        String ipad = "Mozilla/5.0 (iPad; CPU OS 17_0)";
        String iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)";
        String androidMobile = "Mozilla/5.0 (Linux; Android 14; Mobile)";
        String desktop = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

        assertThat(AnalyticsEventGuard.detectDeviceType(ipad, 1024)).isEqualTo("tablet");
        assertThat(AnalyticsEventGuard.detectDeviceType(iphone, 390)).isEqualTo("mobile");
        assertThat(AnalyticsEventGuard.detectDeviceType(androidMobile, 412)).isEqualTo("mobile");
        assertThat(AnalyticsEventGuard.detectDeviceType(desktop, 1920)).isEqualTo("pc");
    }

    @Test
    @DisplayName("화면폭이 480 이하면 UA 판정과 무관하게 mobile 로 덮어쓴다")
    void 좁은_화면폭은_모바일로_보정() {
        String desktopUa = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
        assertThat(AnalyticsEventGuard.detectDeviceType(desktopUa, 480)).isEqualTo("mobile");
        assertThat(AnalyticsEventGuard.detectDeviceType(desktopUa, 481)).isEqualTo("pc");
    }

    @Test
    @DisplayName("UA 에서 브라우저를 판별한다 (Edge/Chrome 이 Safari 문자열을 포함해도 순서대로 걸린다)")
    void 브라우저_판별() {
        String edge = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 Edg/124.0";
        String chrome = "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
        String safari = "Mozilla/5.0 AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
        // 스펙 순서상 Chrome 체크가 Samsung 보다 앞이라 "Chrome/" 토큰이 같이 있으면 Chrome 으로 잡힌다(의도된 동작) — 토큰 없는 UA 로 Samsung 분기 자체를 검증
        String samsung = "Mozilla/5.0 AppleWebKit/537.36 SamsungBrowser/24.0 Mobile Safari/537.36";
        String firefox = "Mozilla/5.0 Gecko/20100101 Firefox/124.0";

        assertThat(AnalyticsEventGuard.detectBrowser(edge)).isEqualTo("Edge");
        assertThat(AnalyticsEventGuard.detectBrowser(chrome)).isEqualTo("Chrome");
        assertThat(AnalyticsEventGuard.detectBrowser(safari)).isEqualTo("Safari");
        assertThat(AnalyticsEventGuard.detectBrowser(samsung)).isEqualTo("Samsung");
        assertThat(AnalyticsEventGuard.detectBrowser(firefox)).isEqualTo("Firefox");
        assertThat(AnalyticsEventGuard.detectBrowser(null)).isEqualTo("Other");
    }

    @Test
    @DisplayName("공통 필수값이 비어 있으면 거부한다")
    void 공통_필수값_누락시_거부() {
        AnalyticsEventItemRequest 세션없음 = item(null, "/home", "reload", null);
        assertThat(AnalyticsEventGuard.hasRequiredFields(세션없음, AnalyticsEventType.CONTENT_CLICK)).isFalse();
    }

    @Test
    @DisplayName("PAGE_VIEW 는 navType 이 없으면 거부한다")
    void PAGE_VIEW_navType_누락시_거부() {
        AnalyticsEventItemRequest navType없음 = item("session-1", "/home", null, null);
        assertThat(AnalyticsEventGuard.hasRequiredFields(navType없음, AnalyticsEventType.PAGE_VIEW)).isFalse();

        AnalyticsEventItemRequest navType있음 = item("session-1", "/home", "reload", null);
        assertThat(AnalyticsEventGuard.hasRequiredFields(navType있음, AnalyticsEventType.PAGE_VIEW)).isTrue();
    }

    @Test
    @DisplayName("OUTBOUND_CLICK 은 targetUrl 이 없으면 거부한다")
    void OUTBOUND_CLICK_targetUrl_누락시_거부() {
        AnalyticsEventItemRequest targetUrl없음 = item("session-1", "/home", null, null);
        assertThat(AnalyticsEventGuard.hasRequiredFields(targetUrl없음, AnalyticsEventType.OUTBOUND_CLICK)).isFalse();

        AnalyticsEventItemRequest targetUrl있음 = new AnalyticsEventItemRequest(
                "OUTBOUND_CLICK", "anon-1", "/home", null, null, "example.com",
                null, null, null, "session-1", null, null
        );
        assertThat(AnalyticsEventGuard.hasRequiredFields(targetUrl있음, AnalyticsEventType.OUTBOUND_CLICK)).isTrue();
    }

    private AnalyticsEventItemRequest item(String sessionId, String pagePath, String navType, String targetUrl) {
        return new AnalyticsEventItemRequest(
                "CONTENT_CLICK", "anon-1", pagePath, null, null, targetUrl,
                null, null, null, sessionId, navType, null
        );
    }
}
