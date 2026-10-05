package com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request;

import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillTier;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** 스킬 등록 — 3칸 전부. */
public record SaveSkillsRequest(@NotNull @Size(min = 3, max = 3) @Valid List<Slot> slots) {
    public record Slot(@NotBlank String skillId, @NotNull SkillTier baseGrade) {
    }
}
