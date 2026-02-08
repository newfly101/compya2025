package com.dawne.com2usbaseball.domain.skill.controller;

import com.dawne.com2usbaseball.domain.skill.dto.response.SkillSetResponse;
import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.dto.response.coach.CoachSkillSetResponse;
import com.dawne.com2usbaseball.domain.skill.service.PlayerSkillsService;
import com.dawne.com2usbaseball.domain.skill.service.coach.CoachSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/skills")
public class SkillController {
    private final PlayerSkillsService playerSkillsService;
    private final CoachSkillService coachSkillService;

    @GetMapping("/{target}")
    public SkillSetResponse playerTypeSkills(@PathVariable Target target) {
        return playerSkillsService.getPlayerSkillSet(target);
    }

    @GetMapping("/coach")
    public CoachSkillSetResponse coachSkills() {
        return coachSkillService.getCoachSkillSet();
    }
}
