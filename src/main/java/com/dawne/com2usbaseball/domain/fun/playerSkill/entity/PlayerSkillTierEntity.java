package com.dawne.com2usbaseball.domain.fun.playerSkill.entity;

import lombok.*;

import java.util.List;

/** data_player_skill_tier + data_player_skill_tier_value. 강화 티어 1단(E~S+) 당 1건. */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerSkillTierEntity {
    private String tier;       // E | D | C | B | A | S | S+
    private String rawValue;   // 원문 표기. "12,3,1/2/4" 처럼 그룹은 '/' 로 구분
    private boolean estimated;

    private List<PlayerSkillTierValueEntity> values;  // value_order 순
}
