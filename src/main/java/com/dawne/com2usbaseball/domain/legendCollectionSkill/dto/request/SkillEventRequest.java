package com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request;

import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillAction;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** slot 은 1~3. 강화 3종만 필수, 나머지는 무시한다. */
public record SkillEventRequest(@NotNull SkillAction action, @Min(1) @Max(3) Integer slot) {
}
