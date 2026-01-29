package com.dawne.com2usbaseball.domain.player.dto.response.identity;

import com.dawne.com2usbaseball.domain.player.dto.response.team.TeamResponse;
import com.dawne.com2usbaseball.common.enums.Grade;

import java.time.LocalDate;

public record PlayerIdentityResponse(
        Long id,
        String name,
        TeamResponse team,
        Grade grade,
        Short backNumber,
        LocalDate birth,
        String batThrow
) {
}
