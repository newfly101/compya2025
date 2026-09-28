package com.dawne.com2usbaseball.domain.analytics.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("세션당 페이지뷰 계산")
class AdminAnalyticsServiceImplTest {

    @Test
    @DisplayName("세션 수로 나눠 소수 1자리로 반환한다")
    void 세션이_있으면_소수1자리로_계산() {
        assertThat(AdminAnalyticsServiceImpl.pageViewsPerSession(3, 10)).isEqualTo(3.3);
        assertThat(AdminAnalyticsServiceImpl.pageViewsPerSession(2, 5)).isEqualTo(2.5);
    }

    @Test
    @DisplayName("세션이 0건이면 null 을 반환한다")
    void 세션이_0건이면_null() {
        assertThat(AdminAnalyticsServiceImpl.pageViewsPerSession(0, 10)).isNull();
    }
}
