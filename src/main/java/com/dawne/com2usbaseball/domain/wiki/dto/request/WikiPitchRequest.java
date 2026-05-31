package com.dawne.com2usbaseball.domain.wiki.dto.request;

import com.dawne.com2usbaseball.domain.wiki.enums.PitchType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WikiPitchRequest(
        @NotBlank String code,
        @NotBlank String name,
        @NotNull PitchType pitchType,
        String description,
        Integer displayOrder
) {
}
