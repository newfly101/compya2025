package com.dawne.com2usbaseball.domain.analytics.repository.mapper;

import com.dawne.com2usbaseball.domain.analytics.entity.AnalyticsEventEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AnalyticsEventMapper {

    /** 한 요청(최대 20건)을 한 번의 INSERT 로 적재한다. */
    int insertAll(@Param("events") List<AnalyticsEventEntity> events);
}
