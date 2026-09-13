package com.dawne.com2usbaseball.domain.statistics.repository.mapper;

import com.dawne.com2usbaseball.domain.statistics.entity.StatisticSupportClickEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface StatisticSupportClickMapper {

    int insert(StatisticSupportClickEntity entity);
}
