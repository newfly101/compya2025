package com.dawne.com2usbaseball.controller.skills;

import com.dawne.com2usbaseball.dto.response.skills.SkillSetResponse;
import com.dawne.com2usbaseball.enums.Target;
import com.dawne.com2usbaseball.service.skills.PlayerSkillsService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/skills")
public class SkillSetController {
    private static final Logger log = LoggerFactory.getLogger(SkillSetController.class);
    private final PlayerSkillsService service;

    @GetMapping("/{target}")
    public SkillSetResponse playerSkills(@PathVariable Target target) {
        SkillSetResponse SAMPLE = service.getSkillSetByTarget(target);
        log.info("result={}",SAMPLE);
        return service.getSkillSetByTarget(target);
    }
}
