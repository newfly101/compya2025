package com.dawne.com2usbaseball.domain.fun.legendCard.entity;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.legendCard.enums.LegendType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * data_player_legend 1:1 매핑.
 * 레전드 1명 = 재료 조합의 결과물.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerLegendEntity {
    private String id;              // UUID v4
    private String legendName;      // 동명이인 접미사 포함 (예: 김재현S)
    private LegendType legendType;
    private String teamCode;        // fun_teams.team_code
    private PlayerRole playerRole;
    private String positionCode;    // SP, 3B, C/DH 등
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
