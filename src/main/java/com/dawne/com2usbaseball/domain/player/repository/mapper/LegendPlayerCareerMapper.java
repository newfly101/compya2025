package com.dawne.com2usbaseball.domain.player.repository.mapper;

import com.dawne.com2usbaseball.domain.player.entity.LegendHitterCareerEntity;
import com.dawne.com2usbaseball.domain.player.entity.LegendPitcherCareerEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LegendPlayerCareerMapper {

    LegendHitterCareerEntity selectCareerByHitter(String name);
    LegendPitcherCareerEntity selectCareerByPitcher(String name);
}
