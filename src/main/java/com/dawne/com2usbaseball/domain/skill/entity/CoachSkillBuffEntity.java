package com.dawne.com2usbaseball.domain.skill.entity;

import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.enums.CoachSkillGrade;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CoachSkillBuffEntity {
    private Long id;
    private CoachSkillGrade grade;
    private Target target;
    private String name;
    private String description;
    private String detailDescription;
}
