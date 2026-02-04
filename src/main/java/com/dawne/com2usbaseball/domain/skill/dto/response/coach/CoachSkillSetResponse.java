package com.dawne.com2usbaseball.domain.skill.dto.response.coach;

import java.util.List;

public record CoachSkillSetResponse(
        List<CoachResponse> coaches,
        List<CoachSkillOptionResponse> conditions,
        List<CoachSkillOptionResponse> buffs
) {
}
