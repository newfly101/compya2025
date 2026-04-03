package com.dawne.com2usbaseball.domain.oauth.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record UserMeResponse(
        Long id,
        String nickname,
        String email,
        String profileImage,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime lastLoginAt
) {}
