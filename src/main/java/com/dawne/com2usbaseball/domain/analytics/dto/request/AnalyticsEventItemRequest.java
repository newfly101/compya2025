package com.dawne.com2usbaseball.domain.analytics.dto.request;

/**
 * FE 와 합의된 단건 이벤트 계약 (컬럼 이름·형태 변경 금지).
 * eventType 은 String 으로 받는다 — 값이 4종 밖이면 그 이벤트만 버려야 하므로
 * Bean Validation/Enum 역직렬화로 요청 전체를 실패시키지 않기 위함.
 */
public record AnalyticsEventItemRequest(
        String eventType,
        String anonId,
        String pagePath,
        String contentType,
        String contentId,
        String targetUrl,
        String searchKeyword,
        String referrer,
        String occurredAt
) {
}
