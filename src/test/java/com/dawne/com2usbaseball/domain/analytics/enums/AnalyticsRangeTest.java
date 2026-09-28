package com.dawne.com2usbaseball.domain.analytics.enums;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("관리자 통계 조회 기간 파라미터 변환")
class AnalyticsRangeTest {

    @Test
    @DisplayName("대소문자 무관하게 TODAY/WEEK/MONTH 로 변환한다")
    void 정상값은_변환됨() {
        assertThat(AnalyticsRange.fromValue("TODAY")).isEqualTo(AnalyticsRange.TODAY);
        assertThat(AnalyticsRange.fromValue("week")).isEqualTo(AnalyticsRange.WEEK);
        assertThat(AnalyticsRange.fromValue("Month")).isEqualTo(AnalyticsRange.MONTH);
    }

    @Test
    @DisplayName("잘못된 값은 400 예외를 던진다")
    void 잘못된_값은_400() {
        assertThatThrownBy(() -> AnalyticsRange.fromValue("YEAR"))
                .isInstanceOf(BaseException.class)
                .satisfies(e -> assertThat(((BaseException) e).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    @DisplayName("값이 없으면 400 예외를 던진다")
    void null값은_400() {
        assertThatThrownBy(() -> AnalyticsRange.fromValue(null))
                .isInstanceOf(BaseException.class);
    }
}
