package com.dawne.com2usbaseball.dto.response.player;

import com.dawne.com2usbaseball.dto.response.player.career.PlayerCareerResponse;
import com.dawne.com2usbaseball.dto.response.player.game.PlayerGameInfoResponse;
import com.dawne.com2usbaseball.dto.response.player.identity.PlayerIdentityResponse;

public record PlayerCardResponse(
        PlayerIdentityResponse identity,
        PlayerGameInfoResponse card,
        PlayerCareerResponse career
) {
}
