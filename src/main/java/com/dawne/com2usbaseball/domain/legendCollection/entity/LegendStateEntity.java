package com.dawne.com2usbaseball.domain.legendCollection.entity;

import lombok.*;
import com.dawne.com2usbaseball.domain.legendCollection.enums.LegendStatus;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LegendStateEntity {
    private String legendId;
    private LegendStatus status;
    private java.time.LocalDate acquiredAt;
    private java.time.LocalDate frameAcquiredAt;
}
