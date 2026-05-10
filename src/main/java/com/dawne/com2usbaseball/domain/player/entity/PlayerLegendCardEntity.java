package com.dawne.com2usbaseball.domain.player.entity;

import com.dawne.com2usbaseball.common.enums.site.Grade;
import com.dawne.com2usbaseball.common.enums.site.Target;
import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerLegendCardEntity {
    Long id;
    String cardCode;
    String name;
    Long teamId;
    Target role;
    Grade grade;
    Short overall;
    Short backNumber;
    LocalDateTime birthDate;
    String batThrow;
    String positions;
    String traits;
    String attributes;
    LocalDateTime createdAt;
}
