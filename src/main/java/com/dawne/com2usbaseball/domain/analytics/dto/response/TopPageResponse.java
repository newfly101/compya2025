package com.dawne.com2usbaseball.domain.analytics.dto.response;

/**
 * returningRate 는 TODAY 는 null(1일 창에선 "재방문" 정의가 성립하지 않음, FE 는 "-" 로 표시),
 * WEEK/MONTH/CUSTOM 은 0~100 사이 퍼센트.
 */
public record TopPageResponse(String pagePath, long count, long uniqueVisitors, Double returningRate) {
}
