package com.dawne.com2usbaseball.domain.skill.service.coach;

import com.dawne.com2usbaseball.domain.skill.dto.response.coach.CoachResponse;
import com.dawne.com2usbaseball.domain.skill.dto.response.coach.CoachSkillOptionResponse;
import com.dawne.com2usbaseball.domain.skill.dto.response.coach.CoachSkillSetResponse;
import com.dawne.com2usbaseball.domain.skill.repository.CoachRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoachSkillServiceImpl implements CoachSkillService {

    private final CoachRepository repository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "coachSkills")
    public CoachSkillSetResponse getCoachSkillSet() {
        return new CoachSkillSetResponse(
                getCoachResponses(),
                getConditionResponses(),
                getBuffResponses()
        );
    }

    /* =======================
       private helpers
       ======================= */

    private List<CoachResponse> getCoachResponses() {
        return repository.getCoaches().stream()
                .map(CoachResponse::from)
                .toList();
    }

    private List<CoachSkillOptionResponse> getBuffResponses() {
        return repository.getCoachSkillBuff().stream()
                .map(CoachSkillOptionResponse::from)
                .toList();
    }

    private List<CoachSkillOptionResponse> getConditionResponses() {
        return repository.getCoachSkillCondition().stream()
                .map(CoachSkillOptionResponse::from)
                .toList();
    }
}
