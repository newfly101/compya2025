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
