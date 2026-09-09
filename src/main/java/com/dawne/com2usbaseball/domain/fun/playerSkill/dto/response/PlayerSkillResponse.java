package com.dawne.com2usbaseball.domain.fun.playerSkill.dto.response;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;

import java.util.List;

/**
 * 스킬 1개의 전체 정보. 티어별 수치까지 한 번에 담는다 — 상세 API 를 따로 두지 않는다.
 *
 * labels(표 행 이름)는 담지 않는다 — DB 에 없는 값이고 화면이 descriptionTemplate 에서 뽑아 쓴다.
 */
public record PlayerSkillResponse(
        String id,
        PlayerRole playerRole,
        String skillGrade,
        String skillName,
        String maxTier,
        Integer sortOrder,
        String descriptionTemplate,
        Integer valueCount,
        String valueGroups,
        List<PlayerSkillTierResponse> tiers
) {
}
