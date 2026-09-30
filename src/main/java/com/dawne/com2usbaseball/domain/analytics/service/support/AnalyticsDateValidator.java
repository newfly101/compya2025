package com.dawne.com2usbaseball.domain.analytics.service.support;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsMessages;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * 관리자 통계의 임의 기간 입력(CUSTOM range · trend)이 공유하는 날짜 검증.
 * aggregate(재집계) · summary(CUSTOM) · trend 3곳에서 재사용 — 검증 코드를 각자 두지 않는다.
 */
public final class AnalyticsDateValidator {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final LocalDate SERVICE_LAUNCH_DATE = LocalDate.of(2026, 1, 29);
    private static final int RETENTION_MONTHS = 3;

    private AnalyticsDateValidator() {
        throw new UnsupportedOperationException();
    }

    /** from ~ to 가 미래·서비스 시작일 이전이거나 역순이면 400. */
    public static void validateRange(LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) {
            throw new BaseException(AnalyticsMessages.ANALYTICS_DATE_OUT_OF_RANGE, HttpStatus.BAD_REQUEST);
        }
        LocalDate today = LocalDate.now(KST);
        if (to.isAfter(today) || from.isBefore(SERVICE_LAUNCH_DATE)) {
            throw new BaseException(AnalyticsMessages.ANALYTICS_DATE_OUT_OF_RANGE, HttpStatus.BAD_REQUEST);
        }
    }

    /** 시간대별 분포(FN-6)는 원본 보관 경계(오늘-3개월) 이전 조회를 막는다. */
    public static void validateWithinRetention(LocalDate from) {
        LocalDate boundary = LocalDate.now(KST).minusMonths(RETENTION_MONTHS);
        if (from == null || from.isBefore(boundary)) {
            throw new BaseException(AnalyticsMessages.ANALYTICS_DATE_OUT_OF_RANGE, HttpStatus.BAD_REQUEST);
        }
    }
}
