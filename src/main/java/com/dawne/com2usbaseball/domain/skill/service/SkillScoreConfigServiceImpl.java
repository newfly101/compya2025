package com.dawne.com2usbaseball.domain.skill.service;

import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.dto.response.SkillScoreConfigEntry;
import com.dawne.com2usbaseball.domain.skill.dto.response.SkillScoreConfigResponse;
import com.dawne.com2usbaseball.domain.skill.entity.SkillScoreConfigEntity;
import com.dawne.com2usbaseball.domain.skill.repository.SkillScoreConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillScoreConfigServiceImpl implements SkillScoreConfigService {

    private final SkillScoreConfigRepository repository;

    @Override
    @Cacheable(value = "skillScoreConfig")
    public SkillScoreConfigResponse getSkillScoreConfig() {
        List<SkillScoreConfigEntry> pitcher = toEntries(repository.findActiveByTarget(Target.PITCHER));
        List<SkillScoreConfigEntry> hitter  = toEntries(repository.findActiveByTarget(Target.HITTER));
        return new SkillScoreConfigResponse(pitcher, hitter);
    }

    private List<SkillScoreConfigEntry> toEntries(List<SkillScoreConfigEntity> entities) {
        return entities.stream()
                .map(e -> new SkillScoreConfigEntry(
                        e.getSkillCode(),
                        e.getPoint(),
                        e.getConditionType(),
                        e.getConditionValue(),
                        e.getEffectType(),
                        e.getEffectPoint()
                ))
                .toList();
    }
}
