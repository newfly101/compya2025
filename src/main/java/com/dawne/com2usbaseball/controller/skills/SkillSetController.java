package com.dawne.com2usbaseball.controller.skills;

import com.dawne.com2usbaseball.dto.response.skills.SkillSetResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SkillSetController {

    @GetMapping("/dictionary/skills/{target}")
//    public SkillSetResponse playerSkills(@PathVariable String target) {
    public String playerSkills(@PathVariable String target) {
//        return skillSetService.getSkillSet(target);
        return "200";
    }
}
