package com.dawne.com2usbaseball.domain.oauth.dto.request;

import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public record AdminUserStatusRequest(
        @NotNull UserStatus userStatus
) {
}
