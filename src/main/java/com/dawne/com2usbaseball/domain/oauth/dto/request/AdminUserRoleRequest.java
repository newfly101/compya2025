package com.dawne.com2usbaseball.domain.oauth.dto.request;

import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public record AdminUserRoleRequest(
        @NotNull UserRole userRole
) {
}
