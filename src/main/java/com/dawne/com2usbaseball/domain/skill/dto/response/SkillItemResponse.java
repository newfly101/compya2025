package com.dawne.com2usbaseball.domain.skill.dto.response;

import com.dawne.com2usbaseball.common.enums.Grade;

public record SkillItemResponse(
        Long id,
        String name,
        Grade grade,
        String description
) { }
