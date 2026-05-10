package com.dawne.com2usbaseball.domain.skill.service;

import com.dawne.com2usbaseball.domain.skill.dto.response.SkillSetResponse;
import com.dawne.com2usbaseball.common.enums.site.Target;

public interface PlayerSkillsService {
    SkillSetResponse getPlayerSkillSet(Target target);
}
