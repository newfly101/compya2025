package com.dawne.com2usbaseball.domain.skill.dto.response;

import java.util.List;

public record SkillScoreConfigResponse(
        List<SkillScoreConfigEntry> pitcher,
        List<SkillScoreConfigEntry> hitter
) { }
