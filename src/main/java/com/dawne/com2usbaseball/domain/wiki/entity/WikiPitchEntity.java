package com.dawne.com2usbaseball.domain.wiki.entity;

import com.dawne.com2usbaseball.domain.wiki.enums.PitchType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WikiPitchEntity {

    private Long id;
    private String code;
    private String name;
    private PitchType pitchType;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
