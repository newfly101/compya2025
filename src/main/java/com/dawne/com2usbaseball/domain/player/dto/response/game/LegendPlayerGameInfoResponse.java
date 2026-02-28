package com.dawne.com2usbaseball.domain.player.dto.response.game;

import com.dawne.com2usbaseball.domain.player.dto.response.game.attributes.PlayerAttributesResponse;

import java.util.List;

public record LegendPlayerGameInfoResponse(
        Short overall,
        List<String> positions,
        List<String> traits,
        PlayerAttributesResponse attributes
) {
}
