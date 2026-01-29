package com.dawne.com2usbaseball.domain.oauth.dto.response;

import java.time.LocalDateTime;

public record UserHealthResponse(
        int id,
        String nickName,
        String email,
        String profileImage,
        LocalDateTime lastLoginAt
) {}
