package com.dawne.com2usbaseball.domain.oauth.entity;

import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

/**
 * site_users 1행 = 사람 1명. OAuth 원본(oauth_*)은 site_user_oauth_accounts 로 분리됐다
 * (UserOAuthAccountEntity). 여기서는 site_users 컬럼만 다룬다 — 개편 3단계(oauth_* 컬럼 DROP)를
 * 위해 이 엔티티는 site_users.oauth_* 컬럼을 읽지도 쓰지도 않는다.
 */
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    private Long id;               // 내부 PK. 밖으로 내보내지 않는다 — 응답은 publicId 사용
    private String publicId;       // 밖으로 노출되는 식별자 (UUID v4)

    // 서비스 정보
    private String nickname;
    private String profileImage; // 사용자가 직접 올린 프로필 이미지
    private String email;
    private UserRole userRole;
    private UserStatus userStatus;

    // OAuth 스냅샷 — site_user_oauth_accounts 를 JOIN 해 읽어온 값. 응답 조립용 읽기 전용 필드이며
    // 이 엔티티를 통해 site_users.oauth_* 컬럼을 쓰지는 않는다
    private String oauthEmail;
    private String oauthProfileImage;

    // 시간
    private LocalDateTime withdrawnAt; // 탈퇴 시각. updated_at 대용 금지
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime lastLoginAt;

}
