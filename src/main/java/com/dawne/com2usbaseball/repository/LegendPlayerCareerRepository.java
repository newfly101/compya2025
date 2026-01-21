package com.dawne.com2usbaseball.repository;

import com.dawne.com2usbaseball.entity.LegendHitterCareerEntity;
import com.dawne.com2usbaseball.entity.LegendPitcherCareerEntity;
import com.dawne.com2usbaseball.repository.mapper.LegendPlayerCareerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class LegendPlayerCareerRepository {

    private final LegendPlayerCareerMapper mapper;

    public LegendHitterCareerEntity findLegendHitterCareerByName(String name) {
        return mapper.selectCareerByHitter(name);
    }

    public LegendPitcherCareerEntity findLegendPitcherCareerByName(String name) {
        return mapper.selectCareerByPitcher(name);
    }
}
