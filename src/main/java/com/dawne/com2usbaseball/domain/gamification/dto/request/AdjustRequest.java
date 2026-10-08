package com.dawne.com2usbaseball.domain.gamification.dto.request;

import jakarta.validation.constraints.NotBlank;

/** 음수 허용(회수). 사유 필수. */
public record AdjustRequest(@NotBlank String publicId, int xp, int point, @NotBlank String reason) {
}
