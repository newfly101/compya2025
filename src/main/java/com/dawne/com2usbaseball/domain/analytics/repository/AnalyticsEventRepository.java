package com.dawne.com2usbaseball.domain.analytics.repository;

import com.dawne.com2usbaseball.domain.analytics.entity.AnalyticsEventEntity;
import com.dawne.com2usbaseball.domain.analytics.repository.mapper.AnalyticsEventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class AnalyticsEventRepository {

    private final AnalyticsEventMapper analyticsEventMapper;

    public void insertAll(List<AnalyticsEventEntity> events) {
        analyticsEventMapper.insertAll(events);
    }
}
