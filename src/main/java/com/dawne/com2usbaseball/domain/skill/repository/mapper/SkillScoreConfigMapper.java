package com.dawne.com2usbaseball.domain.skill.repository.mapper;

import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.entity.SkillScoreConfigEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface SkillScoreConfigMapper {
    List<SkillScoreConfigEntity> selectActiveConfigsByTarget(Target target);
}
