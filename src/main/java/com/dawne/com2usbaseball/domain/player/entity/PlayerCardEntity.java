package com.dawne.com2usbaseball.domain.player.entity;

import com.dawne.com2usbaseball.common.enums.Grade;
import com.dawne.com2usbaseball.common.enums.Target;
import lombok.*;

import java.time.LocalDate;
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
    Short seasonYear;
    Short overall;
    Short backNumber;
    LocalDate birthDate;
    String batThrow;
    String positions;
    String traits;
    LocalDateTime createdAt;
}
