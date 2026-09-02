package com.dawne.com2usbaseball.domain.fun.legendStat.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.legendStat.entity.LegendStatEntity;
import com.dawne.com2usbaseball.domain.fun.legendStat.entity.PitchTypeEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface FunLegendStatMapper {

    /** 스탯 + 구종을 한 번에. 74명 전량을 캐시에 올리므로 조건이 없다. */
    List<LegendStatEntity> findAllWithPitches();

    List<PitchTypeEntity> findAllPitchTypes();
}
