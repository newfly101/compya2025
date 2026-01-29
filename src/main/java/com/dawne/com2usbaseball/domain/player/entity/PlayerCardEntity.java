package com.dawne.com2usbaseball.domain.player.entity;

import com.dawne.com2usbaseball.common.enums.Grade;
import com.dawne.com2usbaseball.common.enums.Target;
import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerCardEntity {
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
