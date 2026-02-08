package com.dawne.com2usbaseball.domain.skill.repository;

import com.dawne.com2usbaseball.domain.skill.entity.CoachEntity;
import com.dawne.com2usbaseball.domain.skill.entity.CoachSkillOptionEntity;
import com.dawne.com2usbaseball.domain.skill.repository.mapper.CoachMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@RequiredArgsConstructor
@Repository
public class CoachRepository {

    private final CoachMapper mapper;

    public List<CoachEntity> getCoaches() {
        return mapper.selectAllCoaches();
    }

    public List<CoachSkillOptionEntity> getCoachSkillBuff() {
        return mapper.selectAllCoachSkillBuff();
    }

    public List<CoachSkillOptionEntity> getCoachSkillCondition() {
        return mapper.selectAllCoachSkillCondition();
    }
}
