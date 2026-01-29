package com.dawne.com2usbaseball.domain.player.dto.response.game.attributes;

public record PitcherAttributesResponse(
        int control,
        int velocity,
        int stamina,
        int fastball,
        int breaking
) implements PlayerAttributesResponse {}
