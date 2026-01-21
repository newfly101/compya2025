package com.dawne.com2usbaseball.dto.response.player.career;

import java.math.BigDecimal;

public record HitterCareerResponse(
        int seasons,
        int games,
        BigDecimal avg,
        int atBats,
        int hits,
        int doubles,
        int triples,
        int homeRuns,
        int steals,
        int rbi,
        int runs,
        int strikeouts,
        int walks
) implements PlayerCareerResponse {}
