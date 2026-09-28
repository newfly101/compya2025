package com.dawne.com2usbaseball.domain.analytics.repository;

import com.dawne.com2usbaseball.domain.analytics.repository.mapper.AnalyticsEventDailyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
@RequiredArgsConstructor
public class AnalyticsEventDailyRepository {

    private final AnalyticsEventDailyMapper analyticsEventDailyMapper;

    public int aggregatePageEvents(LocalDate date) {
        return analyticsEventDailyMapper.aggregatePageEvents(date);
    }

    public int aggregateContentEvents(LocalDate date) {
        return analyticsEventDailyMapper.aggregateContentEvents(date);
    }

    public int aggregateDeviceDaily(LocalDate date) {
        return analyticsEventDailyMapper.aggregateDeviceDaily(date);
    }

    public int aggregateSessionDaily(LocalDate date) {
        return analyticsEventDailyMapper.aggregateSessionDaily(date);
    }

    public int aggregateReferrerDaily(LocalDate date) {
        return analyticsEventDailyMapper.aggregateReferrerDaily(date);
    }
}
