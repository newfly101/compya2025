package com.dawne.com2usbaseball.domain.analytics.repository.mapper;

import com.dawne.com2usbaseball.domain.analytics.dto.response.AnalyticsEventCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.DeviceCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.SessionStatsRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.TopPageResponse;
import com.dawne.com2usbaseball.domain.analytics.dto.response.TopReferrerResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * TODAY 는 원본(site_user_event, 미집계)을, WEEK/MONTH 는 집계(site_user_event_daily)를 읽는다.
 */
@Mapper
public interface AdminAnalyticsMapper {

    long sumTodayVisitors();

    long sumTodayPageViews();

    List<AnalyticsEventCountRow> sumTodayEventCounts();

    List<TopPageResponse> sumTodayTopPages(@Param("limit") int limit);

    long sumTodaySessionCount();

    List<DeviceCountRow> sumTodayDeviceRatio();

    List<TopReferrerResponse> sumTodayTopReferrers(@Param("limit") int limit);

    long sumRangeVisitors(@Param("start") LocalDate start, @Param("end") LocalDate end);

    long sumRangePageViews(@Param("start") LocalDate start, @Param("end") LocalDate end);

    List<AnalyticsEventCountRow> sumRangeEventCounts(@Param("start") LocalDate start, @Param("end") LocalDate end);

    List<TopPageResponse> sumRangeTopPages(@Param("start") LocalDate start, @Param("end") LocalDate end, @Param("limit") int limit);

    SessionStatsRow sumRangeSessionStats(@Param("start") LocalDate start, @Param("end") LocalDate end);

    List<DeviceCountRow> sumRangeDeviceRatio(@Param("start") LocalDate start, @Param("end") LocalDate end);

    List<TopReferrerResponse> sumRangeTopReferrers(@Param("start") LocalDate start, @Param("end") LocalDate end, @Param("limit") int limit);
}
