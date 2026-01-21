package com.dawne.com2usbaseball.repository.mapper;

import com.dawne.com2usbaseball.entity.LegendHitterCareerEntity;
import com.dawne.com2usbaseball.entity.LegendPitcherCareerEntity;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LegendPlayerCareerMapper {

    LegendHitterCareerEntity selectCareerByHitter(String name);
    LegendPitcherCareerEntity selectCareerByPitcher(String name);
}
