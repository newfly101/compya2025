package com.dawne.com2usbaseball.domain.fun.playerSkill.entity;

import lombok.*;

/**
 * data_player_skill_tier_value 1행.
 *
 * MyBatis 는 단순 타입(Integer) 컬렉션에 <id> 가 없으면 매핑된 값 전체를 식별자로 삼아
 * 중복 행을 제거한다 — skillValue 가 같은 행이 여럿이면(예: "8,8") 하나로 뭉개진다.
 * valueOrder 를 <id> 로 잡아 행을 유일하게 식별하기 위해 래퍼 엔티티로 둔다.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PlayerSkillTierValueEntity {
    private Integer valueOrder;
    private Integer skillValue;
}
