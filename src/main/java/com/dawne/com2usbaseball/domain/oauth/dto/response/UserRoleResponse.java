package com.dawne.com2usbaseball.domain.oauth.dto.response;

import com.dawne.com2usbaseball.common.enums.user.UserGrant;
import com.dawne.com2usbaseball.common.enums.user.UserStatus;

import java.time.LocalDateTime;

public record UserRoleResponse(
        UserGrant role,
        UserStatus status,
        String banReason,
        LocalDateTime updatedAt
) {}
