package com.dawne.com2usbaseball.domain.fun.legendCard.entity;

import com.dawne.com2usbaseball.domain.fun.legendCard.enums.MaterialType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * data_player_legend_material 1:1 매핑.
 * 레전드 1명당 선수 6행 + 코치 2행 = 8행.
 * playerName / playerPositionCode / playerCardId 는 PLAYER 행에만 값이 있다.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerLegendMaterialEntity {
    private String id;                  // UUID v4
    private String legendId;            // data_player_legend.id
    private MaterialType materialType;
    private Short slotNo;               // PLAYER 1~6, COACH 1~2
    private String teamCode;            // PLAYER 는 카드 표기 구단, COACH 는 세트 구단
    private Short seasonYear;
    private String playerName;          // COACH 는 null
    private String playerPositionCode;  // 미조사 상태 — 현재 전부 null
    private String playerCardId;        // fun_player_card.id, 추후 연결
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
