package com.dawne.com2usbaseball.domain.player.dto.response.team;

import com.dawne.com2usbaseball.domain.player.entity.TeamsEntity;

public record TeamResponse(
        Long id,
        String teamCode,
        String teamName
) {
    public static TeamResponse from(TeamsEntity t) {
        return new TeamResponse(
                t.getId(),
                t.getTeamCode(),
                t.getTeamName()
        );
    }
}
