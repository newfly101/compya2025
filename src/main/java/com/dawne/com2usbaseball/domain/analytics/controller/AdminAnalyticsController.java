package com.dawne.com2usbaseball.domain.analytics.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.analytics.dto.response.AdminAnalyticsSummaryResponse;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsMessages;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsRange;
import com.dawne.com2usbaseball.domain.analytics.service.AdminAnalyticsService;
import com.dawne.com2usbaseball.domain.analytics.service.AnalyticsAggregationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;
    private final AnalyticsAggregationService analyticsAggregationService;

    @GetMapping("/summary")
    public GlobalResponse<AdminAnalyticsSummaryResponse> getSummary(@RequestParam String range) {
        AdminAnalyticsSummaryResponse summary = adminAnalyticsService.getSummary(AnalyticsRange.fromValue(range));
        return GlobalResponse.success(AnalyticsMessages.ANALYTICS_SUMMARY_SUCCESS, summary);
    }

    /** 새벽 배치와 같은 집계 로직을 수동으로 재실행한다 — 재실행 안전(ON DUPLICATE KEY UPDATE). */
    @PostMapping("/aggregate")
    public GlobalResponse<Void> aggregate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        analyticsAggregationService.aggregateDailyEvents(date);
        return GlobalResponse.success(AnalyticsMessages.ANALYTICS_AGGREGATE_SUCCESS, null);
    }
}
