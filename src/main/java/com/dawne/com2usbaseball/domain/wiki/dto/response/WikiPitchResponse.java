package com.dawne.com2usbaseball.domain.wiki.dto.response;

import com.dawne.com2usbaseball.domain.wiki.enums.PitchType;

import java.util.List;

public record WikiPitchResponse(
        Long id,
        String code,
        String name,
        PitchType pitchType,
        String description,
        Integer displayOrder,
        List<WikiPitchGradeResponse> grades
) {
}
