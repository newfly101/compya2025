package com.dawne.com2usbaseball.domain.fun.legendCard.dto.response;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.legendCard.enums.LegendType;

/**
 * 레전드 목록용. 재료는 포함하지 않는다.
 */
public record FunPlayerLegendResponse(
        String id,
        String legendName,
        LegendType legendType,
        String teamCode,
        PlayerRole playerRole,
        String positionCode
) {
}
