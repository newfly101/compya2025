package com.dawne.com2usbaseball.dto.response.player.game.attributes;

public record PitcherAttributesResponse(
        int control,
        int velocity,
        int stamina,
        int fastball,
        int breaking
) implements PlayerAttributesResponse {}
