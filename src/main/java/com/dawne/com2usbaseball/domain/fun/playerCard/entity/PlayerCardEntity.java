package com.dawne.com2usbaseball.domain.fun.playerCard.entity;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import lombok.*;

/**
 * data_player_card + (LEFT JOIN) data_player_legend_material/data_player_legend 조인 결과.
 * legendName 이 null 이면 레전드 재료가 아닌 카드다.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerCardEntity {
    private String playerName;
    private String teamCode;
    private Integer seasonYear;
    private PlayerRole playerRole;
    private String positionCode;
    private String subPositionCode;   // 겸업 부포지션. 642건만 채워짐, 나머지는 null
    private Boolean hasSignature;
    private String legendName;   // 재료가 아니면 null
}
