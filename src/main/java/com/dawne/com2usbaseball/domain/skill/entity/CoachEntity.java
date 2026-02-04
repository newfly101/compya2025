package com.dawne.com2usbaseball.domain.skill.entity;

import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.enums.CoachPosition;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CoachEntity {
    private Long id;
    private Target role;
    private String name;
    private CoachPosition position;
    private String scope;
}
