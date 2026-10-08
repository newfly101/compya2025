package com.dawne.com2usbaseball.domain.gamification.entity;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardRuleEntity {
    private String activityType;
    private int xp;
    private int point;
    private Integer dailyLimit; // NULL = 무제한
    private boolean oncePerAccount;
}
