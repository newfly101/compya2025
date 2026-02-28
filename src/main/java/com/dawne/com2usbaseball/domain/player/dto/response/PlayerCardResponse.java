package com.dawne.com2usbaseball.domain.player.dto.response;

import com.dawne.com2usbaseball.common.enums.Grade;
import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.player.entity.PlayerCardEntity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PlayerCardResponse(
        Long id,
        String cardCode,
        String name,
        Long teamId,
        Target role,
        Grade grade,
        Short seasonYear,
        Short overall,
        Short backNumber,
        LocalDate birthDate,
        String batThrow,
        String positions,
        String traits,
        LocalDateTime createdAt
) {
    public static PlayerCardResponse from(PlayerCardEntity p) {
        return new PlayerCardResponse(
                p.getId(),
                p.getCardCode(),
                p.getName(),
                p.getTeamId(),
                p.getRole(),
                p.getGrade(),
                p.getSeasonYear(),
                p.getOverall(),
                p.getBackNumber(),
                p.getBirthDate(),
                p.getBatThrow(),
                p.getPositions(),
                p.getTraits(),
                p.getCreatedAt()
        );
    }
}
