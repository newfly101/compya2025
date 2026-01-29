package com.dawne.com2usbaseball.domain.oauth.entity;

import com.dawne.com2usbaseball.common.enums.user.UserGrant;
import com.dawne.com2usbaseball.common.enums.user.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleEntity {
    private int userId;
    private UserGrant role;
    private UserStatus status;
    private String banReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
