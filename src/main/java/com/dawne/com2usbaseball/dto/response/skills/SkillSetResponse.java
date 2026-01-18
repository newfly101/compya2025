package com.dawne.com2usbaseball.dto.response.skills;

import java.util.List;

public record SkillSetResponse(
        List<SkillItemResponse> legend,
        List<SkillItemResponse> platinum,
        List<SkillItemResponse> hero,
        List<SkillItemResponse> normal
) { }
