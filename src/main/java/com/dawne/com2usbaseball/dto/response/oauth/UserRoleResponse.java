package com.dawne.com2usbaseball.dto.response.oauth;

import com.dawne.com2usbaseball.enums.user.UserGrant;
import com.dawne.com2usbaseball.enums.user.UserStatus;

import java.time.LocalDateTime;

public record UserRoleResponse(
        UserGrant role,
        UserStatus status,
        String banReason,
        LocalDateTime updatedAt
) {}
