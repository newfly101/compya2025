package com.dawne.com2usbaseball.domain.legendCollection.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** 선호 저장 — 순위 목록 전체 교체 + 모달 안의 액자 토글 변경분. */
public record SavePreferencesRequest(
        String version,
        @NotNull @Valid @Size(max = 10) List<Preference> preferences,
        @Valid @Size(max = 100) List<FrameToggle> frames
) {
    public record Preference(@NotBlank String legendId, @NotNull @Min(1) @Max(10) Integer rank) {
    }

    public record FrameToggle(@NotBlank String legendId, @NotNull Boolean frame) {
    }
}
