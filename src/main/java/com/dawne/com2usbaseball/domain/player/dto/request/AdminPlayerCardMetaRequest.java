package com.dawne.com2usbaseball.domain.player.dto.request;

import com.dawne.com2usbaseball.common.enums.Grade;
import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.player.entity.PlayerCardEntity;

import java.time.LocalDate;

public record AdminPlayerCardMetaRequest(
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
        String traits
) {
    public PlayerCardEntity toEntity() {
        return PlayerCardEntity.builder()
                .cardCode(cardCode)
                .name(name)
                .teamId(teamId)
                .role(role)
                .grade(grade)
                .seasonYear(seasonYear)
                .overall(overall)
                .backNumber(backNumber)
                .birthDate(birthDate)
                .batThrow(batThrow)
                .positions(positions)
                .traits(traits)
                .build();
    }
}
