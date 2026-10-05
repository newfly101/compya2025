package com.dawne.com2usbaseball.domain.legendCollectionSkill.entity;

import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillTier;
import lombok.*;

/** site_user_legend_skills 한 행 — 슬롯 3개가 평평하게 들어 있다. */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserLegendSkillEntity {
    private Long userId;
    private String legendId;
    private String skill1Id;
    private SkillTier skill1Base;
    private SkillTier skill1Current;
    private String skill2Id;
    private SkillTier skill2Base;
    private SkillTier skill2Current;
    private String skill3Id;
    private SkillTier skill3Base;
    private SkillTier skill3Current;
}
