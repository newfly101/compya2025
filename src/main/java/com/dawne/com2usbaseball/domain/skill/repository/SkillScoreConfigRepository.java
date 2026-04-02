package com.dawne.com2usbaseball.domain.skill.repository;

import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.entity.SkillScoreConfigEntity;
import com.dawne.com2usbaseball.domain.skill.repository.mapper.SkillScoreConfigMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class SkillScoreConfigRepository {

    private final SkillScoreConfigMapper mapper;

    public List<SkillScoreConfigEntity> findActiveByTarget(Target target) {
        return mapper.selectActiveConfigsByTarget(target);
    }
}
