package com.dawne.com2usbaseball.repository.mapper;

import com.dawne.com2usbaseball.entity.PlayerCardEntity;
import com.dawne.com2usbaseball.enums.Target;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PlayerCardMapper {
    List<PlayerCardEntity> selectPlayersByPosition(Target target);
}
