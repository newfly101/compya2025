package com.dawne.com2usbaseball.domain.gamification.entity;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TitleEntity {
    private Long id;
    private String code;
    private String name;
    private String category;
    private int bonusPoint;
    private LocalDate signupFrom;
    private LocalDate signupTo;
    private LocalDate grantEnd;
    private LocalDateTime grantedAt; // 보유 칭호 조회에서만 채워진다
    private boolean equipped; // 보유 칭호 조회에서만 채워진다
}
