package com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request;

import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillAction;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** 강화(BASE_UP·GCG_UP·GGG_UP)를 묶어서 한 번에 저장. 1~50개, 순서대로 적용. */
public record BatchEventRequest(@NotEmpty @Size(max = 50) List<@Valid @NotNull Item> actions) {

    public record Item(@NotNull SkillAction action, @NotNull @Min(1) @Max(3) Integer slot) {
    }
}
