package com.dawne.com2usbaseball.domain.analytics.repository;

import com.dawne.com2usbaseball.domain.analytics.dto.response.AnalyticsEventCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.DeviceCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.SessionStatsRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.TopPageResponse;
import com.dawne.com2usbaseball.domain.analytics.dto.response.TopReferrerResponse;
import com.dawne.com2usbaseball.domain.analytics.repository.mapper.AdminAnalyticsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class AdminAnalyticsRepository {

    private final AdminAnalyticsMapper adminAnalyticsMapper;

    public long sumTodayVisitors() {
        return adminAnalyticsMapper.sumTodayVisitors();
    }

    public long sumTodayPageViews() {
        return adminAnalyticsMapper.sumTodayPageViews();
    }

    public List<AnalyticsEventCountRow> sumTodayEventCounts() {
        return adminAnalyticsMapper.sumTodayEventCounts();
    }

    public List<TopPageResponse> sumTodayTopPages(int limit) {
        return adminAnalyticsMapper.sumTodayTopPages(limit);
    }

    public long sumTodaySessionCount() {
        return adminAnalyticsMapper.sumTodaySessionCount();
    }

    public List<DeviceCountRow> sumTodayDeviceRatio() {
        return adminAnalyticsMapper.sumTodayDeviceRatio();
    }

    public List<TopReferrerResponse> sumTodayTopReferrers(int limit) {
        return adminAnalyticsMapper.sumTodayTopReferrers(limit);
    }

    public long sumRangeVisitors(LocalDate start, LocalDate end) {
        return adminAnalyticsMapper.sumRangeVisitors(start, end);
    }

    public long sumRangePageViews(LocalDate start, LocalDate end) {
        return adminAnalyticsMapper.sumRangePageViews(start, end);
    }

    public List<AnalyticsEventCountRow> sumRangeEventCounts(LocalDate start, LocalDate end) {
        return adminAnalyticsMapper.sumRangeEventCounts(start, end);
    }

    public List<TopPageResponse> sumRangeTopPages(LocalDate start, LocalDate end, int limit) {
        return adminAnalyticsMapper.sumRangeTopPages(start, end, limit);
    }

    public SessionStatsRow sumRangeSessionStats(LocalDate start, LocalDate end) {
        return adminAnalyticsMapper.sumRangeSessionStats(start, end);
    }

    public List<DeviceCountRow> sumRangeDeviceRatio(LocalDate start, LocalDate end) {
        return adminAnalyticsMapper.sumRangeDeviceRatio(start, end);
    }

    public List<TopReferrerResponse> sumRangeTopReferrers(LocalDate start, LocalDate end, int limit) {
        return adminAnalyticsMapper.sumRangeTopReferrers(start, end, limit);
    }
}
