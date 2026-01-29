package com.dawne.com2usbaseball.domain.player.repository.mapper;

import com.dawne.com2usbaseball.domain.player.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.common.enums.Target;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PlayerCardMapper {
    List<PlayerCardEntity> selectPlayersByPosition(Target target);
}
