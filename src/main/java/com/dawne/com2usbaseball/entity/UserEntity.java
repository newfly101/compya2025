package com.dawne.com2usbaseball.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    private int id;
    private String provider;
    private String providerId;
    private String nickname;
    private String email;
    private String profileImage;
    private String ageRange;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }
}
