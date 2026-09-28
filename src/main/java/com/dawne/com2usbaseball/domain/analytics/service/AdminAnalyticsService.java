package com.dawne.com2usbaseball.domain.analytics.service;

import com.dawne.com2usbaseball.domain.analytics.dto.response.AdminAnalyticsSummaryResponse;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsRange;

public interface AdminAnalyticsService {

    AdminAnalyticsSummaryResponse getSummary(AnalyticsRange range);
}
