package com.dawne.com2usbaseball.domain.fun.legendStat.dto.response;

/** 표시명·정렬 순서는 /api/legend-stats/pitch-types 마스터에 있다. */
public record FunLegendPitchResponse(
        String pitchCode,
        String pitchGrade
) {
}
