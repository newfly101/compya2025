package com.dawne.com2usbaseball.domain.fun.playerSkill.service;

import com.dawne.com2usbaseball.domain.fun.playerSkill.dto.PlayerSkillSnapshot;
import com.dawne.com2usbaseball.domain.fun.playerSkill.dto.response.PlayerSkillResponse;

public interface PlayerSkillService {

    /** 타자 스킬 46건 전량. 필터·정렬은 화면이 한다. */
    PlayerSkillSnapshot<PlayerSkillResponse> getHitterSkills();

    /** 투수 스킬 46건 전량. */
    PlayerSkillSnapshot<PlayerSkillResponse> getPitcherSkills();
}
