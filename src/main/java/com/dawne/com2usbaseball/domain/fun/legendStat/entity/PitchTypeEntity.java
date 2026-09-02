package com.dawne.com2usbaseball.domain.fun.legendStat.entity;

import lombok.*;

/** data_pitch_type. 10행 고정 마스터. */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PitchTypeEntity {
    private String pitchCode;
    private String pitchName;
    private String statGroup;   // FASTBALL=stat4(직구) / BREAKING=stat5(변화)
    private Short sortNo;
}
