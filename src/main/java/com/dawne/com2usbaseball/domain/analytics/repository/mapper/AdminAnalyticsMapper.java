package com.dawne.com2usbaseball.domain.analytics.repository.mapper;

import com.dawne.com2usbaseball.domain.analytics.dto.response.AnalyticsEventCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.AnalyticsTrendPointResponse;
import com.dawne.com2usbaseball.domain.analytics.dto.response.DeviceCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.RegionCountRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.SessionStatsRow;
import com.dawne.com2usbaseball.domain.analytics.dto.response.TopPageResponse;
import com.dawne.com2usbaseball.domain.analytics.dto.response.TopReferrerResponse;
import com.dawne.com2usbaseball.domain.analytics.dto.response.VisitorCompositionRow;
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

    /** 배치와 동일한 "세션·경로 30초 내 중복 제거" 로 오늘 하루 세션당 PV 를 계산한다(§3 FN-9). */
    SessionStatsRow sumTodaySessionStats();

    List<AnalyticsTrendPointResponse> sumDailyTrend(@Param("start") LocalDate start, @Param("end") LocalDate end);

    List<AnalyticsTrendPointResponse> sumHourlyTrend(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /** site_user_first_seen 기반 신규/재방문 구성. start==end 이면 TODAY 창(하루)으로도 쓰인다. */
    List<VisitorCompositionRow> sumVisitorComposition(@Param("start") LocalDate start, @Param("end") LocalDate end);

    /** GeoIP 지역 라벨(city, 없으면 country)별 순방문자 상위 10 + 나머지 "기타". start==end 면 TODAY 창으로도 쓰인다. */
    List<RegionCountRow> sumRegionRatio(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
