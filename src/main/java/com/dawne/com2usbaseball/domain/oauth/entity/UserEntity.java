package com.dawne.com2usbaseball.domain.oauth.entity;

import com.dawne.com2usbaseball.domain.oauth.enums.OAuthProvider;
import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
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
    private String profileImage; // 사용자가 직접 올린 프로필 이미지 (네이버 제공 이미지인 oauthProfileImage 와 구분)
    private String email;
    private UserRole userRole;
    private UserStatus userStatus;

    // 시간
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime lastLoginAt;

}
