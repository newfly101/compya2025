package com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.response;

import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillTier;

import java.util.List;

/** 레전드 1명의 스킬 상태. GET 목록 항목 = 등록·이벤트 응답 모양. */
public record LegendSkillResponse(
        String legendId,
        String status,
        List<SlotItem> slots,
        String bulkMode,
        Usage usage,
        int enhanceCount
) {
    public record SlotItem(String skillId, SkillTier baseGrade, SkillTier currentGrade) {
    }

    public record Usage(int base, int gcg, int ggg) {
    }
}
