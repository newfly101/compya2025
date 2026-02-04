package com.dawne.com2usbaseball.domain.skill.service.coach;

import com.dawne.com2usbaseball.domain.skill.dto.response.coach.CoachSkillSetResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class CoachSkillServiceImpl implements CoachSkillService {

    @Override
    @Transactional(readOnly = true)
    public CoachSkillSetResponse getCoachSkillSet() {
        return null;
    }
}
