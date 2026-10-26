package com.dawne.com2usbaseball.domain.simulator.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** site_user_simulator_saves — created_at 은 DB 기본값. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulatorSaveEntity {
    private Long id;
    private Long userId;
    private String legendId;
    private Integer gsbCount;
    private Integer selCount;
    private String skillId1;
    private String skillId2;
    private String skillId3;
    private String skillTier1;
    private String skillTier2;
    private String skillTier3;
    private LocalDateTime createdAt;
}
