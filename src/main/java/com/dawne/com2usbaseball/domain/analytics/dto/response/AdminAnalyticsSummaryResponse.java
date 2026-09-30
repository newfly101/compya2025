package com.dawne.com2usbaseball.domain.analytics.dto.response;

import java.util.List;
import java.util.Map;

public record AdminAnalyticsSummaryResponse(
        String range,
        long uniqueVisitors,
        long pageViews,
        Map<String, Long> eventCounts,
        List<TopPageResponse> topPages,
        Long sessionCount,
        Map<String, Long> deviceRatio,
        List<TopReferrerResponse> topReferrers,
        Double pageViewsPerSession,
        Map<String, Long> visitorComposition,
        Map<String, Long> signupConversion,
        Map<String, Long> regionRatio
) {
}
