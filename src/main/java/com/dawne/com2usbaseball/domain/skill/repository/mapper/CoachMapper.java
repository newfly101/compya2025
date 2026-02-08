package com.dawne.com2usbaseball.domain.skill.repository.mapper;

import com.dawne.com2usbaseball.domain.skill.entity.CoachEntity;
import com.dawne.com2usbaseball.domain.skill.entity.CoachSkillOptionEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CoachMapper {

    // select All DB
    List<CoachEntity> selectAllCoaches();
    List<CoachSkillOptionEntity> selectAllCoachSkillBuff();
    List<CoachSkillOptionEntity> selectAllCoachSkillCondition();
}
