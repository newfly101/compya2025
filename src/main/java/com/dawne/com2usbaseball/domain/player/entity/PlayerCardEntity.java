package com.dawne.com2usbaseball.domain.player.entity;

import com.dawne.com2usbaseball.common.enums.site.Grade;
import com.dawne.com2usbaseball.common.enums.site.Target;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerCardEntity {
    private Long id;
    private String cardCode;
    private String name;
    private Long teamId;
    private Target role;
    private Grade grade;
    private Short seasonYear;
    private Short overall;
    private Short backNumber;
    private LocalDate birthDate;
    private String batThrow;
    private String positions;
    private String traits;
    private LocalDateTime createdAt;
}
