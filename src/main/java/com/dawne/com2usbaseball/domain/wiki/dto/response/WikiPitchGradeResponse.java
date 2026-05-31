package com.dawne.com2usbaseball.domain.wiki.dto.response;

public record WikiPitchGradeResponse(
        Long id,
        String pitchCode,
        String grade,
        Integer velocityMin,
        Integer velocityMax,
        Integer breakAmount,
        String description
) {
}
