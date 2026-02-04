package com.dawne.com2usbaseball.domain.skill.dto.response.coach;

import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.entity.CoachSkillOptionEntity;
import com.dawne.com2usbaseball.domain.skill.enums.CoachSkillGrade;

public record CoachSkillOptionResponse(
        CoachSkillGrade grade,
        Target target,
        String name,
        String description,
        String detailDescription
) {
    public static CoachSkillOptionResponse from(CoachSkillOptionEntity c) {
        return new CoachSkillOptionResponse(
                c.getGrade(),
                c.getTarget(),
                c.getName(),
                c.getDescription(),
                c.getDetailDescription()
        );
    }
}
