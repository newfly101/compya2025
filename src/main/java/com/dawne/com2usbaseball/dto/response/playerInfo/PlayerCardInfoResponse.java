package com.dawne.com2usbaseball.dto.response.playerInfo;

import com.dawne.com2usbaseball.entity.PlayerCardEntity;

public record PlayerCardInfoResponse(
        Long id,
        String cardCode,
        Short overall,
        Short backNumber,
        String positions,
        String traits,
        String attributes
) {
    public static PlayerCardInfoResponse from(PlayerCardEntity e) {
        return new PlayerCardInfoResponse(
                e.getId(),
                e.getCardCode(),
                e.getOverall(),
                e.getBackNumber(),
                e.getPositions(),
                e.getTraits(),
                e.getAttributes()
        );
    }
}
