package com.dawne.com2usbaseball.domain.analytics.enums;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import org.springframework.http.HttpStatus;

public enum AnalyticsRange {
    TODAY,
    WEEK,
    MONTH,
    /** from/to 를 직접 받는 임의 기간. AdminAnalyticsService 가 날짜 검증(AnalyticsDateValidator) 후 사용. */
    CUSTOM;

    /** 쿼리 파라미터 문자열 → enum. 잘못된 값(대소문자 무관 매칭 실패)은 400. */
    public static AnalyticsRange fromValue(String raw) {
        if (raw != null) {
            for (AnalyticsRange range : values()) {
                if (range.name().equalsIgnoreCase(raw)) {
                    return range;
                }
            }
        }
        throw new BaseException(AnalyticsMessages.ANALYTICS_RANGE_INVALID, HttpStatus.BAD_REQUEST);
    }
}
