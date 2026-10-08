package com.dawne.com2usbaseball.domain.gamification.entity;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardLevelEntity {
    private int level;
    private String name;
    private int requiredXp;
    private int levelupBonusPoint;
}
