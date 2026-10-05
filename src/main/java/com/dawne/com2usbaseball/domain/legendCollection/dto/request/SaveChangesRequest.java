package com.dawne.com2usbaseball.domain.legendCollection.dto.request;

import com.dawne.com2usbaseball.domain.legendCollection.enums.LegendStatus;
import com.dawne.com2usbaseball.domain.legendCollection.enums.MaterialState;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/**
 * 편집 저장 — 바뀐 칸만 모아 한 번에 보낸다.
 * version 은 GET 으로 받은 값 그대로(기록이 아직 없으면 null).
 * resetLegendIds 의 레전드는 저장된 삽입까지 포함해 재료 8칸을 모두 지운다.
 */
public record SaveChangesRequest(
        String version,
        @Valid @Size(max = 600) List<MaterialChange> materials,
        @Valid @Size(max = 100) List<LegendChange> legends,
        @Size(max = 100) List<@NotBlank String> resetLegendIds
) {
    public record MaterialChange(@NotBlank String materialId, @NotNull MaterialState state) {
    }

    /** acquiredOn: 선택. 액자/보유중이 된 날짜(없으면 오늘 KST). */
    public record LegendChange(@NotBlank String legendId, @NotNull LegendStatus status, LocalDate acquiredOn) {
    }
}
