package com.dawne.com2usbaseball.domain.fun.legendStat.entity;

import lombok.*;

/** data_player_legend_pitch. 보유한 구종만 행이 있고 미조사 등급은 null. */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LegendPitchEntity {
    private String pitchCode;
    private String pitchGrade;
}
