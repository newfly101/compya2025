package com.dawne.com2usbaseball.domain.fun.legendStat.entity;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.legendCard.enums.LegendType;
import lombok.*;

import java.util.List;

/** data_player_legend + data_player_legend_stat 조인 결과. 타자는 pitches 가 빈 목록. */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LegendStatEntity {
    private String id;
    private String legendName;
    private LegendType legendType;
    private String teamCode;
    private PlayerRole playerRole;
    private String positionCode;   // "SS/CF" 처럼 슬래시로 이어져 있다

    private Short stat1;
    private Short stat2;
    private Short stat3;
    private Short stat4;
    private Short stat5;

    private java.math.BigDecimal rating;
    private String ratingRev;

    private List<LegendPitchEntity> pitches;
}
