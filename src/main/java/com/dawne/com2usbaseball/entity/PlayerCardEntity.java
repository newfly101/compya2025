package com.dawne.com2usbaseball.entity;

import com.dawne.com2usbaseball.enums.Grade;
import com.dawne.com2usbaseball.enums.Target;
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
    LocalDateTime birth_date;
    String batThrow;
    String positions;
    String traits;
    String attributes;
    LocalDateTime createdAt;
}
