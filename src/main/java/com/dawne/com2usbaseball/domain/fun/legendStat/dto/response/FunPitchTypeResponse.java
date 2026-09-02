package com.dawne.com2usbaseball.domain.fun.legendStat.dto.response;

/** sortNo 는 게임 UI 배치 순서. */
public record FunPitchTypeResponse(
        String pitchCode,
        String pitchName,
        String statGroup,
        Short sortNo
) {
}
