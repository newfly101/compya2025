package com.dawne.com2usbaseball.domain.fun.historyMode.entity;

import lombok.*;

import java.util.List;

/** data_history_round + 로스터 25명. */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class HistoryRoundEntity {
    private String id;
    private Short dayNo;
    private Short roundNo;
    private String roundLabel;
    private List<HistoryRosterEntity> roster;
}
