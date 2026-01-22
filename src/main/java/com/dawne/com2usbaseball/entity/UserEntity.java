package com.dawne.com2usbaseball.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {
    private int id;
    private String provider;
    private String providerId;
    private String email;
    private String nickname;
    private LocalDate year;
    private String phoneNumber;
    private String profileImage;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private String gender;

    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }
}
