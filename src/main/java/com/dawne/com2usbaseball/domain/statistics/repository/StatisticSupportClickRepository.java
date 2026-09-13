package com.dawne.com2usbaseball.domain.statistics.repository;

import com.dawne.com2usbaseball.domain.statistics.entity.StatisticSupportClickEntity;
import com.dawne.com2usbaseball.domain.statistics.repository.mapper.StatisticSupportClickMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class StatisticSupportClickRepository {

    private final StatisticSupportClickMapper statisticSupportClickMapper;

    public boolean insert(StatisticSupportClickEntity entity) {
        return statisticSupportClickMapper.insert(entity) > 0;
    }
}
