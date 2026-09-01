package com.dawne.com2usbaseball.domain.fun.legendCard.dto.response;

import com.dawne.com2usbaseball.domain.fun.legendCard.enums.MaterialType;

/**
 * 재료 1행.
 * COACH 행은 playerName / playerPositionCode / playerCardId 가 모두 null 이고,
 * teamCode + seasonYear 로 "그 구단 그 연도 코치 세트(6장)"를 뜻한다.
 */
public record FunPlayerLegendMaterialResponse(
        String id,
        MaterialType materialType,
        Short slotNo,
        String teamCode,
        Short seasonYear,
        String playerName,
        String playerPositionCode,
        String playerCardId
) {
}
