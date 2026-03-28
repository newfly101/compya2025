package com.dawne.com2usbaseball.domain.skill.entity;

import com.dawne.com2usbaseball.common.enums.Target;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SkillScoreConfigEntity {
    private Long id;
    private String skillCode;
    private Target target;
    private int point;
    private String conditionType;   // NONE / WITH_SKILL
    private String conditionValue;  // nullable
    private String effectType;      // ADD / SUB
    private Integer effectPoint;    // nullable
    private boolean isActive;
}
