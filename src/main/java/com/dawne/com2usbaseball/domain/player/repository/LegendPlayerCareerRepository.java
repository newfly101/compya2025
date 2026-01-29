package com.dawne.com2usbaseball.domain.player.repository;

import com.dawne.com2usbaseball.domain.player.entity.LegendHitterCareerEntity;
import com.dawne.com2usbaseball.domain.player.entity.LegendPitcherCareerEntity;
import com.dawne.com2usbaseball.domain.player.repository.mapper.LegendPlayerCareerMapper;
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
