package com.dawne.com2usbaseball.domain.community.dto.response.board;

import com.dawne.com2usbaseball.common.enums.user.UserGrant;
import com.dawne.com2usbaseball.common.enums.user.UserType;
import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;

public record BoardResponse(
        Long id,
        String code,
        String name,
        String description,
        UserGrant writeRole,        // 'ADMIN', 'USER
        UserType readRole,          // 'ALL', 'LOGIN
        boolean visible,
        boolean deleted,
        int sortOrder
) {
        public static BoardResponse from(BoardsEntity b) {
                return new BoardResponse(
                        b.getId(),
                        b.getCode(),
                        b.getName(),
                        b.getDescription(),
                        b.getWriteRole(),
                        b.getReadRole(),
                        b.isVisible(),
                        b.isDeleted(),
                        b.getSortOrder()
                );
        }
}
