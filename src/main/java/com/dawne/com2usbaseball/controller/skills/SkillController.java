package com.dawne.com2usbaseball.controller.skills;

import com.dawne.com2usbaseball.dto.response.skills.SkillSetResponse;
import com.dawne.com2usbaseball.enums.Target;
import com.dawne.com2usbaseball.service.skills.PlayerSkillsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/skills")
public class SkillController {
    private final PlayerSkillsService service;

    @GetMapping("/{target}")
    public SkillSetResponse playerTypeSkills(@PathVariable Target target) {
        return service.getPlayerSkillSet(target);
    }
}
