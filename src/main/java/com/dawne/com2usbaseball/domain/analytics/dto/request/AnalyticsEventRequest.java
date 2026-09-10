package com.dawne.com2usbaseball.domain.analytics.dto.request;

import java.util.List;

public record AnalyticsEventRequest(
        List<AnalyticsEventItemRequest> events
) {
}
