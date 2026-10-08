package com.dawne.com2usbaseball.domain.gamification.entity;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerEntity {
    private Long id;
    private Long userId;
    private String rewardKey;
    private String sourceType;
    private int xpDelta;
    private int pointDelta;
    private LocalDate rewardDate;
    private String refCode;
    private String reason;
    private LocalDateTime createdAt;
}
