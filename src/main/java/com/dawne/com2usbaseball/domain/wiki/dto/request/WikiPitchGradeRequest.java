package com.dawne.com2usbaseball.domain.wiki.dto.request;

import jakarta.validation.constraints.NotBlank;

public record WikiPitchGradeRequest(
        @NotBlank String pitchCode,
        @NotBlank String grade,
        Integer velocityMin,
        Integer velocityMax,
        Integer breakAmount,
        String description
) {
}
