package com.dawne.com2usbaseball.domain.simulator.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/** 선수 한 명의 고스변 기록. PUT 항목이자 POST saves 본문. */
public record GsbEntryRequest(
        @NotBlank @Size(min = 36, max = 36) String legendId,
        @NotNull @Min(0) @Max(9_999_999) Integer gsbCount,
        @NotNull @Min(0) @Max(9_999_999) Integer selCount,
        @NotNull @Size(min = 3, max = 3) List<@NotBlank @Size(min = 36, max = 36) String> skillIds,
        /** 스킬 3칸 등급 글자(E·D·C). PUT 은 선택, POST saves 는 서비스에서 필수 확인. */
        @Size(min = 3, max = 3) List<@NotNull @Pattern(regexp = "[EDC]") String> skillTiers) {
}
