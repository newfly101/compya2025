package com.dawne.com2usbaseball.domain.skill.dto.response;

public record SkillScoreConfigEntry(
        String skillCode,
        int point,
        String conditionType,
        String conditionValue,
        String effectType,
        Integer effectPoint
) { }
