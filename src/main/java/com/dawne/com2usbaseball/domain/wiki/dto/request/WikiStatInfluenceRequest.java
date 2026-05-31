package com.dawne.com2usbaseball.domain.wiki.dto.request;

import com.dawne.com2usbaseball.domain.wiki.enums.InfluenceType;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WikiStatInfluenceRequest(
        @NotNull WikiTarget target,
        @NotBlank String statCode,
        @NotNull InfluenceType influenceType,
        @NotBlank String influenceTarget,
        Integer weight,
        String description,
        Integer displayOrder
) {
}
