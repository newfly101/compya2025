package com.dawne.com2usbaseball.domain.board.entity;

import com.dawne.com2usbaseball.common.enums.user.UserGrant;
import com.dawne.com2usbaseball.common.enums.user.UserType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BoardsEntity {
    private Long id;
    private String code;
    private String name;
    private String description;
    private UserGrant writeRole;        // 'ADMIN', 'USER'
    private UserType readRole;          // 'ALL', 'LOGIN'
    private boolean visible;
    private boolean deleted;
    private int sortOrder;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;
}
