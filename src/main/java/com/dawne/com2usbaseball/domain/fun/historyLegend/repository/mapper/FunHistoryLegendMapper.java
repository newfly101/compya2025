package com.dawne.com2usbaseball.domain.fun.historyLegend.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.historyLegend.entity.HistoryRoundEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface FunHistoryLegendMapper {

    /** 라운드 70개 + 로스터 1,750행을 한 번에. 조건이 없다 — 전량을 캐시에 올린다. */
    List<HistoryRoundEntity> findAllWithRoster();
}
