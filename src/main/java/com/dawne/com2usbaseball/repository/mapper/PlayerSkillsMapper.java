package com.dawne.com2usbaseball.repository.mapper;

import com.dawne.com2usbaseball.entity.PlayerSkillsEntity;
import com.dawne.com2usbaseball.enums.Target;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PlayerSkillsMapper {
    List<PlayerSkillsEntity> selectSkillsByTarget(Target target);
}
