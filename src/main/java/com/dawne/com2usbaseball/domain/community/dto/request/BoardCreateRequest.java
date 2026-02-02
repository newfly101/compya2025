package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.common.enums.user.UserGrant;
import com.dawne.com2usbaseball.common.enums.user.UserType;
import com.dawne.com2usbaseball.domain.community.entity.BoardsEntity;

public record BoardCreateRequest(
        String code,
        String name,
        String description,
        UserGrant writeRole,        // 'ADMIN', 'USER,
        UserType readRole,          // 'ALL', 'LOGIN,
        boolean visible,
        boolean deleted,
        int sortOrder
) {
    public BoardsEntity toEntity() {
        BoardsEntity b = new BoardsEntity();
        applyTo(b);
        return b;
    }

    public BoardsEntity toEntity(Long id) {
        BoardsEntity b = new BoardsEntity();
        b.setId(id);
        applyTo(b);
        return b;
    }


    private void applyTo(BoardsEntity b) {
        b.setCode(code);
        b.setName(name);
        b.setDescription(description);
        b.setWriteRole(writeRole);
        b.setReadRole(readRole);
        b.setVisible(visible);
        b.setDeleted(deleted);
        b.setSortOrder(sortOrder);
    }
}
