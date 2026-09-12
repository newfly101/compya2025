package com.dawne.com2usbaseball.domain.fun.playerCard.dto.response;

/** 구종 표시명·정렬 순서는 /api/legend-stats/pitch-types 마스터(data_pitch_type)를 공유해서 쓴다. */
public record PlayerCardPitchResponse(
        String c,   // pitchCode
        String g    // pitchGrade (E~S)
) {
}
