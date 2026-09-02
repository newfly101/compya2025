package com.dawne.com2usbaseball.domain.fun.legendStat.repository;

import com.dawne.com2usbaseball.domain.fun.legendStat.entity.LegendStatEntity;
import com.dawne.com2usbaseball.domain.fun.legendStat.entity.PitchTypeEntity;
import com.dawne.com2usbaseball.domain.fun.legendStat.repository.mapper.FunLegendStatMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FunLegendStatRepository {

    private final FunLegendStatMapper legendStatMapper;

    public List<LegendStatEntity> findAllWithPitches() {
        return legendStatMapper.findAllWithPitches();
    }

    public List<PitchTypeEntity> findAllPitchTypes() {
        return legendStatMapper.findAllPitchTypes();
    }
}
