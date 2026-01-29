package com.dawne.com2usbaseball.domain.skill.repository;

import com.dawne.com2usbaseball.domain.player.entity.PlayerSkillsEntity;
import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.repository.mapper.PlayerSkillsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PlayerSkillsRepository {

    private final PlayerSkillsMapper mapper;

    // 타자/투수 스킬 조회 (target = 선수 타입)
    public List<PlayerSkillsEntity> findAllSkillSetByTarget(Target target) {
        return mapper.selectSkillsByTarget(target);
    }
}
