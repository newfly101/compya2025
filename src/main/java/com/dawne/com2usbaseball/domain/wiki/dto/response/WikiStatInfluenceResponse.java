package com.dawne.com2usbaseball.domain.wiki.dto.response;

import com.dawne.com2usbaseball.domain.wiki.enums.InfluenceType;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;

public record WikiStatInfluenceResponse(
        Long id,
        WikiTarget target,
        String statCode,
        InfluenceType influenceType,
        String influenceTarget,
        Integer weight,
        String description,
        Integer displayOrder
) {
}
