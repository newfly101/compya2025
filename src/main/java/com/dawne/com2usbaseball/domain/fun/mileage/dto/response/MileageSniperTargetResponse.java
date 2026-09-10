package com.dawne.com2usbaseball.domain.fun.mileage.dto.response;

/**
 * 마일리지 저격 대상 카드 1건.
 * cardId 는 FE 가 재료(data_player_legend_material.player_card_id)와 대조하는 핵심 값이다.
 */
public record MileageSniperTargetResponse(
        String cardId,
        String teamCode,
        Integer seasonYear,
        String positionCode,
        String playerName,
        String legendName
) {
}
