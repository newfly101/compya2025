package com.dawne.com2usbaseball.domain.wiki.entity;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WikiPitchGradeEntity {

    private Long id;
    private String pitchCode;
    private String grade;
    private Integer velocityMin;
    private Integer velocityMax;
    private Integer breakAmount;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
