package com.dawne.com2usbaseball.dto.response.player.game.attributes;

public record HitterAttributesResponse(
        int accuracy,
        int power,
        int contact,
        int speed,
        int defense
) implements PlayerAttributesResponse {}
