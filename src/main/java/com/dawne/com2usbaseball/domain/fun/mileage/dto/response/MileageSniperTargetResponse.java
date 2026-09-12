package com.dawne.com2usbaseball.domain.fun.mileage.dto.response;

/**
 * 마일리지 저격 대상 카드 1건.
 * cardId 는 FE 가 재료(data_player_legend_material.player_card_id)와 대조하는 핵심 값이다.
 * subPositionCode 는 겸업 부포지션(없으면 null) — 화면이 "1B/DH" 형태로 표기한다.
 *
 * mainUnique/subUnique — 어느 칸이 실제로 혼자라 저격 가능한지. 시뮬레이션 목표 포지션은
 * 이 값으로 정한다: mainUnique 면 positionCode, subUnique 면 subPositionCode 가 목표다.
 * 둘 다 true 인 카드도 있다(주·부 모두 그 시즌 그 팀에서 혼자) — 그 경우 두 칸 다 목표로 유효하다.
 */
public record MileageSniperTargetResponse(
        String cardId,
        String teamCode,
        Integer seasonYear,
        String positionCode,
        String subPositionCode,
        boolean mainUnique,
        boolean subUnique,
        String playerName,
        String legendName
) {
}
