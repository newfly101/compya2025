package com.dawne.com2usbaseball.domain.oauth.entity;

import com.dawne.com2usbaseball.domain.oauth.enums.OAuthProvider;
import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    private Long id;

    // OAuth 정보
    private OAuthProvider provider;
    private String providerId;
    private String oauthNickname;
    private String oauthEmail;
    private String oauthProfileImage;
    private String oauthAgeRange;

    // 서비스 정보
    private String nickname;
    private UserRole userRole;
    private UserStatus userStatus;

    // 시간
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;

}
