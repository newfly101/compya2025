package com.dawne.com2usbaseball.dto.response.oauth;

import java.time.LocalDateTime;

public record UserHealthResponse(
        int id,
        String nickName,
        String email,
        String profileImage,
        LocalDateTime lastLoginAt
) {}
