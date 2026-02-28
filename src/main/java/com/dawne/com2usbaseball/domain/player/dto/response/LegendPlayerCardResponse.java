package com.dawne.com2usbaseball.domain.player.dto.response;

import com.dawne.com2usbaseball.domain.player.dto.response.career.PlayerCareerResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.game.LegendPlayerGameInfoResponse;
import com.dawne.com2usbaseball.domain.player.dto.response.identity.LegendPlayerIdentityResponse;

public record LegendPlayerCardResponse(
        LegendPlayerIdentityResponse identity,
        LegendPlayerGameInfoResponse card,
        PlayerCareerResponse career
) {
}
