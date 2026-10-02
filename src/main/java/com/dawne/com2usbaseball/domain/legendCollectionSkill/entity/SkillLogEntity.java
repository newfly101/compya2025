package com.dawne.com2usbaseball.domain.legendCollectionSkill.entity;

import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillAction;
import lombok.*;

/** 집계용 로그 한 줄 (id 순). */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SkillLogEntity {
    private String legendId;
    private SkillAction action;
}
