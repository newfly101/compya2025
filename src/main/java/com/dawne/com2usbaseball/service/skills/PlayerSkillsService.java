package com.dawne.com2usbaseball.service.skills;

import com.dawne.com2usbaseball.dto.response.skills.SkillSetResponse;
import com.dawne.com2usbaseball.enums.Target;

public interface PlayerSkillsService {
    SkillSetResponse getPlayerSkillSet(Target target);
}
