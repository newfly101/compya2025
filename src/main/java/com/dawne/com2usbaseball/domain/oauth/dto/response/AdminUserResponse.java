package com.dawne.com2usbaseball.domain.oauth.dto.response;

import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record AdminUserResponse(
        String publicId,
        String nickname,
        String email,
        UserRole userRole,
        UserStatus userStatus,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime lastLoginAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt
) {
    public static AdminUserResponse from(
            String publicId, String nickname, String email,
            UserRole userRole, UserStatus userStatus,
            LocalDateTime lastLoginAt, LocalDateTime createdAt
    ) {
        return new AdminUserResponse(publicId, nickname, email, userRole, userStatus, lastLoginAt, createdAt);
    }
}
