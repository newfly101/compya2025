package com.dawne.com2usbaseball.domain.skill.dto.response.coach;

import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.enums.CoachSkillGrade;

public record CoachSkillOptionResponse(
        CoachSkillGrade grade,
        Target target,
        String name,
        String description,
        String detailDescription
) {
}
