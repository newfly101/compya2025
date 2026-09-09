package com.dawne.com2usbaseball.domain.fun.playerSkill.entity;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import lombok.*;

import java.util.List;

/** data_player_skill + data_player_skill_tier(+value) 조인 결과. role 별 46건. */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerSkillEntity {
    private String id;
    private PlayerRole playerRole;
    private String skillName;
    private String skillGrade;   // NORMAL | HERO | PLATINUM | LEGEND
    private String maxTier;      // E | D | C | B | A | S | S+
    private Integer sortOrder;
    private String descriptionTemplate;
    private Integer valueCount;
    private String valueGroups;

    private List<PlayerSkillTierEntity> tiers;
}
