package com.dawne.com2usbaseball.domain.gamification.dto.request;

import jakarta.validation.constraints.NotBlank;

/** 운영자 칭호 지급·회수 요청. */
public record TitleActionRequest(@NotBlank String publicId, @NotBlank String code) {
}
