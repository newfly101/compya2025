package com.dawne.com2usbaseball.repository;

import com.dawne.com2usbaseball.entity.PlayerSkillsEntity;
import com.dawne.com2usbaseball.enums.Target;
import com.dawne.com2usbaseball.repository.mapper.PlayerSkillsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PlayerSkillsRepository {

    private final PlayerSkillsMapper mapper;

    // 타자/투수 스킬 조회 (target = 선수 타입)
    public List<PlayerSkillsEntity> findByTarget(Target target) {
        return mapper.findByTarget(target);
    }
}
