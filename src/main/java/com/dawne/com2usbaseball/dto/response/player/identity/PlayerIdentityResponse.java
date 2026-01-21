package com.dawne.com2usbaseball.dto.response.player.identity;

import com.dawne.com2usbaseball.dto.response.player.team.TeamResponse;
import com.dawne.com2usbaseball.enums.Grade;

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
