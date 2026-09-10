package com.dawne.com2usbaseball.domain.analytics.service.support;

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
}
