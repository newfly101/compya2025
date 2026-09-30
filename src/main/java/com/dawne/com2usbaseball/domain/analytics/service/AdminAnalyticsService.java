package com.dawne.com2usbaseball.domain.analytics.service;

import com.dawne.com2usbaseball.domain.analytics.dto.response.AdminAnalyticsSummaryResponse;
import com.dawne.com2usbaseball.domain.analytics.dto.response.AnalyticsTrendPointResponse;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsRange;

import java.time.LocalDate;
import java.util.List;

public interface AdminAnalyticsService {

    /** range!=CUSTOM 이면 from/to 는 무시된다. CUSTOM 이면 둘 다 필수(AnalyticsDateValidator 검증). */
    AdminAnalyticsSummaryResponse getSummary(AnalyticsRange range, LocalDate from, LocalDate to);

    /** granularity: "day"(기본) | "hour". hour 는 원본 보관 경계(최근 3개월) 안쪽만 허용. */
    List<AnalyticsTrendPointResponse> getTrend(LocalDate from, LocalDate to, String granularity);
}
