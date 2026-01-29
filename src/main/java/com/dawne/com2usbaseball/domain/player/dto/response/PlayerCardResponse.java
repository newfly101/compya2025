package com.dawne.com2usbaseball.domain.player.dto.response;

import com.dawne.com2usbaseball.domain.player.dto.response.career.PlayerCareerResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.game.PlayerGameInfoResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.identity.PlayerIdentityResponse;

public record PlayerCardResponse(
        PlayerIdentityResponse identity,
        PlayerGameInfoResponse card,
        PlayerCareerResponse career
) {
}
