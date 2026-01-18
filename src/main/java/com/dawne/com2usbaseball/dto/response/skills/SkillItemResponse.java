package com.dawne.com2usbaseball.dto.response.skills;

import com.dawne.com2usbaseball.enums.Grade;

public record SkillItemResponse(
        Long id,
        String name,
        Grade grade
) { }
