package com.dawne.com2usbaseball.dto.response.player.career;

import java.math.BigDecimal;

public record PitcherCareerResponse(
        int seasons,
        int games,
        BigDecimal era,
        int wins,
        int losses,
        int saves,
        int holds,
        int strikeouts,
        int walks,
        int hitsAllowed
) implements PlayerCareerResponse {}
