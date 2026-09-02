package com.dawne.com2usbaseball.domain.fun.historyMode.entity;

import lombok.*;

/**
 * data_history_roster 1행 + 재료 판정 결과.
 * legendName 은 data_player_legend_material 조인으로 붙는다 (재료가 아니면 null).
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HistoryRosterEntity {
    private String rosterGroup;
    private Short orderNo;
    private String playerName;
    private Short seasonYear;
    private String positionCode;   // 조사 전이라 대부분 null
    private String legendName;
}
