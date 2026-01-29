package com.dawne.com2usbaseball.domain.skill.repository.mapper;

import com.dawne.com2usbaseball.domain.player.entity.PlayerSkillsEntity;
import com.dawne.com2usbaseball.common.enums.Target;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PlayerSkillsMapper {
    List<PlayerSkillsEntity> selectSkillsByTarget(Target target);
}
