package com.dawne.com2usbaseball.domain.oauth.dto.request;

import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;

public record AdminUserListRequest(
        String nickname,
        UserRole userRole,
        UserStatus userStatus,
        Integer page,
        Integer size
) {
    public AdminUserListRequest {
        if (page == null) page = 0;
        if (size == null) size = 20;
    }

    public int offset() {
        return page * size;
    }
}
