package com.dawne.com2usbaseball.repository.mapper;

import com.dawne.com2usbaseball.entity.TeamsEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface TeamMapper {

    TeamsEntity selectTeamById(Long id);
    List<TeamsEntity> selectTeamAll();
}
