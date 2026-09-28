package com.dawne.com2usbaseball.domain.analytics.service;

import com.dawne.com2usbaseball.domain.analytics.dto.response.AdminAnalyticsSummaryResponse;
import com.dawne.com2usbaseball.domain.analytics.dto.response.AnalyticsEventCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.DeviceCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.SessionStatsRow;
import com.dawne.com2usbaseball.domain.analytics.enums.AnalyticsRange;
import com.dawne.com2usbaseball.domain.analytics.repository.AdminAnalyticsRepository;
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

    private final AdminAnalyticsRepository adminAnalyticsRepository;

    @Override
    public AdminAnalyticsSummaryResponse getSummary(AnalyticsRange range) {
        if (range == AnalyticsRange.TODAY) {
            long sessionCount = adminAnalyticsRepository.sumTodaySessionCount();
            long pageViews = adminAnalyticsRepository.sumTodayPageViews();
            return new AdminAnalyticsSummaryResponse(
                    range.name(),
                    adminAnalyticsRepository.sumTodayVisitors(),
                    pageViews,
                    toMap(adminAnalyticsRepository.sumTodayEventCounts()),
                    adminAnalyticsRepository.sumTodayTopPages(TOP_PAGES_LIMIT),
                    sessionCount,
                    toDeviceMap(adminAnalyticsRepository.sumTodayDeviceRatio()),
                    adminAnalyticsRepository.sumTodayTopReferrers(TOP_PAGES_LIMIT),
                    pageViewsPerSession(sessionCount, pageViews)
            );
        }

        // 배치가 전날까지만 채우므로 end 는 항상 어제. WEEK=최근 완료된 7일, MONTH=30일
        LocalDate end = LocalDate.now(ZoneId.of("Asia/Seoul")).minusDays(1);
        LocalDate start = end.minusDays((range == AnalyticsRange.WEEK ? 7 : 30) - 1L);

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
                pageViewsPerSession(sessionStats.sessionCount(), sessionStats.pageViewCount())
        );
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
}
