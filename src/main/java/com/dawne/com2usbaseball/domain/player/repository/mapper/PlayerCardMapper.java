package com.dawne.com2usbaseball.domain.player.repository.mapper;

import com.dawne.com2usbaseball.domain.player.entity.*;
import com.dawne.com2usbaseball.common.enums.Target;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PlayerCardMapper {
    List<PlayerLegendCardEntity> selectPlayersByPosition(Target target);
    int insertPlayerCard(PlayerCardEntity card);
    int insertHitterAttribute(HitterAttributeEntity hitter);
    int insertPitcherAttribute(PitcherAttributeEntity pitcher);
}
