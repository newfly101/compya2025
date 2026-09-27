package com.dawne.com2usbaseball.domain.fun.historyLegend.repository;

import com.dawne.com2usbaseball.domain.fun.historyLegend.entity.HistoryRoundEntity;
import com.dawne.com2usbaseball.domain.fun.historyLegend.repository.mapper.FunHistoryLegendMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FunHistoryLegendRepository {

    private final FunHistoryLegendMapper historyLegendMapper;

    public List<HistoryRoundEntity> findAllWithRoster() {
        return historyLegendMapper.findAllWithRoster();
    }
}
