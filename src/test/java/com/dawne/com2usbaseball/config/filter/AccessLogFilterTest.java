package com.dawne.com2usbaseball.config.filter;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("접근 로그 쿼리스트링 마스킹")
class AccessLogFilterTest {

    @Test
    @DisplayName("OAuth 콜백의 code·state 값은 로그에 남지 않는다")
    void OAuth_콜백_값은_마스킹된다() {
        assertThat(AccessLogFilter.maskQuery("code=AbCd1234&state=xyz"))
                .isEqualTo("?code=***&state=***");
    }

    @Test
    @DisplayName("일반 파라미터는 그대로 남는다")
    void 일반_파라미터는_유지된다() {
        assertThat(AccessLogFilter.maskQuery("page=2&type=COUPON"))
                .isEqualTo("?page=2&type=COUPON");
    }

    @Test
    @DisplayName("쿼리스트링이 없으면 빈 문자열이다")
    void 쿼리가_없으면_빈값() {
        assertThat(AccessLogFilter.maskQuery(null)).isEmpty();
        assertThat(AccessLogFilter.maskQuery("")).isEmpty();
    }

    @Test
    @DisplayName("값 없는 키나 줄바꿈이 섞여도 한 줄을 유지한다")
    void 깨진_쿼리도_한줄_유지() {
        assertThat(AccessLogFilter.maskQuery("flag&token=a\nb"))
                .isEqualTo("?flag&token=***");
    }
}
