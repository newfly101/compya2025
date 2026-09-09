package com.dawne.com2usbaseball.domain.fun.playerSkill.dto.response;

import java.util.List;

/** rawValue 는 원문 그대로, values 는 화면이 바로 치환에 쓸 수 있게 파싱해 둔 값. */
public record PlayerSkillTierResponse(
        String tier,
        String rawValue,
        boolean estimated,
        List<Integer> values
) {
}
