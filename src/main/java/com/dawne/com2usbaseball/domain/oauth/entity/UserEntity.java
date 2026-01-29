package com.dawne.com2usbaseball.domain.oauth.entity;

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
    private String oauthNickname;
    private String oauthEmail;
    private String oauthProfileImage;
    private String oauthAgeRange;
    private String nickname;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }
}
