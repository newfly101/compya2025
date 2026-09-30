package com.dawne.com2usbaseball.domain.analytics.service.support;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatNoException;

@DisplayName("관리자 통계 임의 기간 날짜 검증")
class AnalyticsDateValidatorTest {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    @Test
    @DisplayName("서비스 시작일 이후 ~ 오늘까지는 통과한다")
    void 정상범위는_통과() {
        LocalDate today = LocalDate.now(KST);
        assertThatNoException().isThrownBy(() -> AnalyticsDateValidator.validateRange(today.minusDays(3), today));
    }

    @Test
    @DisplayName("미래 날짜가 섞이면 400 예외를 던진다")
    void 미래날짜는_400() {
        LocalDate today = LocalDate.now(KST);
        assertThatThrownBy(() -> AnalyticsDateValidator.validateRange(today, today.plusDays(1)))
                .isInstanceOf(BaseException.class)
                .satisfies(e -> assertThat(((BaseException) e).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    @DisplayName("서비스 시작일 이전이면 400 예외를 던진다")
    void 서비스시작일_이전은_400() {
        assertThatThrownBy(() -> AnalyticsDateValidator.validateRange(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 30)))
                .isInstanceOf(BaseException.class);
    }

    @Test
    @DisplayName("from 이 to 보다 늦으면 400 예외를 던진다")
    void 역순범위는_400() {
        LocalDate today = LocalDate.now(KST);
        assertThatThrownBy(() -> AnalyticsDateValidator.validateRange(today, today.minusDays(1)))
                .isInstanceOf(BaseException.class);
    }

    @Test
    @DisplayName("보관 경계(오늘-3개월) 이전 from 은 400 예외를 던진다")
    void 보관경계_이전은_400() {
        LocalDate boundary = LocalDate.now(KST).minusMonths(3);
        assertThatThrownBy(() -> AnalyticsDateValidator.validateWithinRetention(boundary.minusDays(1)))
                .isInstanceOf(BaseException.class);
    }

    @Test
    @DisplayName("보관 경계 안쪽 from 은 통과한다")
    void 보관경계_안쪽은_통과() {
        LocalDate boundary = LocalDate.now(KST).minusMonths(3);
        assertThatNoException().isThrownBy(() -> AnalyticsDateValidator.validateWithinRetention(boundary.plusDays(1)));
    }
}
