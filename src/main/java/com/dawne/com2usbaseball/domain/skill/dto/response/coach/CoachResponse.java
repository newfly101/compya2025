package com.dawne.com2usbaseball.domain.skill.dto.response.coach;

import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.entity.CoachEntity;
import com.dawne.com2usbaseball.domain.skill.enums.CoachPosition;

public record CoachResponse(
        Target role,
        String name,
        CoachPosition position,
        String scope
) {
    public static CoachResponse from(CoachEntity c) {
        return new CoachResponse(
                c.getRole(),
                c.getName(),
                c.getPosition(),
                c.getScope()
        );
    }
}
