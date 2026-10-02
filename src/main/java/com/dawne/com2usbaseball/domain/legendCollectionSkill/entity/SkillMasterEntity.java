package com.dawne.com2usbaseball.domain.legendCollectionSkill.entity;

import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillKind;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SkillMasterEntity {
    private String id;
    private String playerRole;
    private SkillKind skillGrade;
}
