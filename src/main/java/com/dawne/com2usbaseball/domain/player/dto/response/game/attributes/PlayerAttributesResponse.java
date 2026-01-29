package com.dawne.com2usbaseball.domain.player.dto.response.game.attributes;

public sealed interface PlayerAttributesResponse permits
    HitterAttributesResponse, PitcherAttributesResponse{
}
