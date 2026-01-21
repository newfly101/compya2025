package com.dawne.com2usbaseball.dto.response.player.game;

import com.dawne.com2usbaseball.dto.response.player.game.attributes.PlayerAttributesResponse;

import java.util.List;

public record PlayerGameInfoResponse(
        Short overall,
        List<String> positions,
        List<String> traits,
        PlayerAttributesResponse attributes
) {
}
