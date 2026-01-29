package com.dawne.com2usbaseball.domain.player.repository.mapper;

import com.dawne.com2usbaseball.domain.player.entity.TeamsEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TeamMapper {

    TeamsEntity selectTeamById(Long id);
    List<TeamsEntity> selectTeamAll();
}
