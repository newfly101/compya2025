package com.dawne.com2usbaseball.domain.player.dto.response.game.attributes;

public record HitterAttributesResponse(
        int accuracy,
        int power,
        int contact,
        int speed,
        int defense
) implements PlayerAttributesResponse {}
