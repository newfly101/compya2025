package com.dawne.com2usbaseball.domain.wiki.entity;

import com.dawne.com2usbaseball.domain.wiki.enums.InfluenceType;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WikiStatInfluenceEntity {

    private Long id;
    private WikiTarget target;
    private String statCode;
    private InfluenceType influenceType;
    private String influenceTarget;
    private Integer weight;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
