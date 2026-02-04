package com.dawne.com2usbaseball.domain.skill.service.coach;

import com.dawne.com2usbaseball.domain.skill.dto.response.coach.CoachSkillSetResponse;

public interface CoachSkillService {
    // 코치 immutable DB 그대로 전달
    CoachSkillSetResponse getCoachSkillSet();
}
