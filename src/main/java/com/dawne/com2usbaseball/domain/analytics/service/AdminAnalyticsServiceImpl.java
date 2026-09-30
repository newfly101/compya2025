package com.dawne.com2usbaseball.domain.analytics.service;

import com.dawne.com2usbaseball.domain.analytics.dto.response.AdminAnalyticsSummaryResponse;
import com.dawne.com2usbaseball.domain.analytics.dto.response.AnalyticsEventCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.AnalyticsTrendPointResponse;
import com.dawne.com2usbaseball.domain.analytics.dto.response.DeviceCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.RegionCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.SessionStatsRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.SignupConversionRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.VisitorCompositionRow;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsRange;
import com.dawne.com2usbaseball.domain.analytics.repository.AdminAnalyticsRepository;
import com.dawne.com2usbaseball.domain.analytics.repository.AnalyticsFirstSeenRepository;
import com.dawne.com2usbaseball.domain.analytics.service.support.AnalyticsDateValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private static final int TOP_PAGES_LIMIT = 10;
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");

    private final AdminAnalyticsRepository adminAnalyticsRepository;
    private final AnalyticsFirstSeenRepository analyticsFirstSeenRepository;

    @Override
    public AdminAnalyticsSummaryResponse getSummary(AnalyticsRange range, LocalDate from, LocalDate to) {
        if (range == AnalyticsRange.TODAY) {
            LocalDate today = LocalDate.now(KST);
            long pageViews = adminAnalyticsRepository.sumTodayPageViews();
            long sessionCount = adminAnalyticsRepository.sumTodaySessionCount();
            SessionStatsRow dedupedStats = adminAnalyticsRepository.sumTodaySessionStats();
            return new AdminAnalyticsSummaryResponse(
                    range.name(),
                    adminAnalyticsRepository.sumTodayVisitors(),
                    pageViews,
                    toMap(adminAnalyticsRepository.sumTodayEventCounts()),
                    adminAnalyticsRepository.sumTodayTopPages(TOP_PAGES_LIMIT),
                    sessionCount,
                    toDeviceMap(adminAnalyticsRepository.sumTodayDeviceRatio()),
                    adminAnalyticsRepository.sumTodayTopReferrers(TOP_PAGES_LIMIT),
                    pageViewsPerSession(dedupedStats.sessionCount(), dedupedStats.pageViewCount()),
                    toVisitorMap(adminAnalyticsRepository.sumVisitorComposition(today, today)),
                    toSignupMap(analyticsFirstSeenRepository.sumSignupConversion(today, today)),
                    toRegionMap(adminAnalyticsRepository.sumRegionRatio(today, today))
            );
        }

        LocalDate start;
        LocalDate end;
        if (range == AnalyticsRange.CUSTOM) {
            AnalyticsDateValidator.validateRange(from, to);
            start = from;
            end = to;
        } else {
            // 배치가 전날까지만 채우므로 end 는 항상 어제. WEEK=최근 완료된 7일, MONTH=30일
            end = LocalDate.now(KST).minusDays(1);
            start = end.minusDays((range == AnalyticsRange.WEEK ? 7 : 30) - 1L);
        }

        SessionStatsRow sessionStats = adminAnalyticsRepository.sumRangeSessionStats(start, end);
        return new AdminAnalyticsSummaryResponse(
                range.name(),
                adminAnalyticsRepository.sumRangeVisitors(start, end),
                adminAnalyticsRepository.sumRangePageViews(start, end),
                toMap(adminAnalyticsRepository.sumRangeEventCounts(start, end)),
                adminAnalyticsRepository.sumRangeTopPages(start, end, TOP_PAGES_LIMIT),
                sessionStats.sessionCount(),
                toDeviceMap(adminAnalyticsRepository.sumRangeDeviceRatio(start, end)),
                adminAnalyticsRepository.sumRangeTopReferrers(start, end, TOP_PAGES_LIMIT),
                pageViewsPerSession(sessionStats.sessionCount(), sessionStats.pageViewCount()),
                toVisitorMap(adminAnalyticsRepository.sumVisitorComposition(start, end)),
                toSignupMap(analyticsFirstSeenRepository.sumSignupConversion(start, end)),
                AnalyticsDateValidator.isWithinRetention(start)
                        ? toRegionMap(adminAnalyticsRepository.sumRegionRatio(start, end))
                        : new LinkedHashMap<>()
        );
    }

    @Override
    public List<AnalyticsTrendPointResponse> getTrend(LocalDate from, LocalDate to, String granularity) {
        AnalyticsDateValidator.validateRange(from, to);
        if ("hour".equalsIgnoreCase(granularity)) {
            AnalyticsDateValidator.validateWithinRetention(from);
            return adminAnalyticsRepository.sumHourlyTrend(from, to);
        }
        return adminAnalyticsRepository.sumDailyTrend(from, to);
    }

    /** 소수 1자리로 고정 — FE 는 이 값을 그대로 문자열화만 한다. 세션이 0건이면 null("-"). package-private: 테스트 접근용. */
    static Double pageViewsPerSession(long sessionCount, long pageViews) {
        if (sessionCount <= 0) {
            return null;
        }
        return Math.round((pageViews / (double) sessionCount) * 10) / 10.0;
    }

    private Map<String, Long> toMap(List<AnalyticsEventCountRow> rows) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (AnalyticsEventCountRow row : rows) {
            result.put(row.eventType(), row.count());
        }
        return result;
    }

    private Map<String, Long> toDeviceMap(List<DeviceCountRow> rows) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (DeviceCountRow row : rows) {
            result.put(row.deviceType(), row.count());
        }
        return result;
    }

    private Map<String, Long> toVisitorMap(List<VisitorCompositionRow> rows) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (VisitorCompositionRow row : rows) {
            result.put(row.visitorType(), row.count());
        }
        return result;
    }

    private Map<String, Long> toSignupMap(List<SignupConversionRow> rows) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (SignupConversionRow row : rows) {
            result.put(row.conversionType(), row.count());
        }
        return result;
    }

    private Map<String, Long> toRegionMap(List<RegionCountRow> rows) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (RegionCountRow row : rows) {
            result.put(row.region(), row.count());
        }
        return result;
    }
}
