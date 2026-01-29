package com.dawne.com2usbaseball.domain.skill.dto.response;

import java.util.List;

public record SkillSetResponse(
        List<SkillItemResponse> legend,
        List<SkillItemResponse> platinum,
        List<SkillItemResponse> hero,
        List<SkillItemResponse> normal
) { }
