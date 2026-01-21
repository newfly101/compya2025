package com.dawne.com2usbaseball.dto.response.player.game.attributes;

public record PitcherAttributesResponse(
        int velocity,
        int control,
        int stamina,
        int breaking,
        int movement
) implements PlayerAttributesResponse {}
