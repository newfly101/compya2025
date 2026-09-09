package com.dawne.com2usbaseball.domain.fun.playerSkill.repository;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.playerSkill.entity.PlayerSkillEntity;
import com.dawne.com2usbaseball.domain.fun.playerSkill.repository.mapper.PlayerSkillMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PlayerSkillRepository {

    private final PlayerSkillMapper playerSkillMapper;

    public List<PlayerSkillEntity> findHitterSkills() {
        return playerSkillMapper.findByRole(PlayerRole.HITTER.name());
    }

    public List<PlayerSkillEntity> findPitcherSkills() {
        return playerSkillMapper.findByRole(PlayerRole.PITCHER.name());
    }
}
