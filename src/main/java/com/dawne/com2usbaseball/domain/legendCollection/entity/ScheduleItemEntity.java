package com.dawne.com2usbaseball.domain.legendCollection.entity;

import lombok.*;
import com.dawne.com2usbaseball.domain.legendCollection.enums.LegendStatus;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleItemEntity {
    private Integer dayNo;
    private Integer roundNo;
    private String roundLabel;
    private String legendId;
    private String legendName;
    private Integer rankNo;
    private LegendStatus legendStatus;
    private String materialId;
    private String playerName;
    private Integer seasonYear;
}
