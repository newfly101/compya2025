package com.dawne.com2usbaseball.domain.community.dto.response;

import com.dawne.com2usbaseball.domain.community.enums.ReadRoleType;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;

import java.time.LocalDateTime;

public record BoardResponse(
        Long id,
        String code,
        String name,
        String description,
        UserRoleType userRoleType,
        ReadRoleType readRoleType,
        Boolean useComment,
        Boolean useLike,
        Boolean useTag,
        Boolean isVisible,
        Boolean isDeleted,
        Integer sortOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
