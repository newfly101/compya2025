package com.dawne.com2usbaseball.domain.analytics.service;

import java.time.LocalDate;

public interface AnalyticsAggregationService {

    /** 지정한 날짜의 site_user_event 를 site_user_event_daily 로 집계한다. 재실행 안전. */
    void aggregateDailyEvents(LocalDate date);
}
