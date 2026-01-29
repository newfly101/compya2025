package com.dawne.com2usbaseball.domain.player.entity;

import com.dawne.com2usbaseball.common.enums.Grade;
import com.dawne.com2usbaseball.common.enums.Target;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;


@Getter
@Setter
@NoArgsConstructor
public class PlayerSkillsEntity {
    Long id;
    String skillCode;
    String name;
    String description;
    Grade grade;
    Target target;
    Timestamp createdAt;
}
