package com.dawne.com2usbaseball.domain.oauth.entity;

import lombok.*;

import java.time.LocalDateTime;

/**
 * 로그인 수단(OAuth) 원본 — site_user_oauth_accounts 1행 = 로그인 수단 1개.
 * 지금은 사람당 로그인 수단이 1개뿐이라 결과적으로 user_id 당 1행이지만,
 * 구조상 한 user_id 가 여러 행을 가질 수 있게 열려 있다(연결/해제 화면은 이번 범위 아님).
 */
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserOAuthAccountEntity {

    private Long id;
    private Long userId; // site_users.id 참조

    private String provider;
    private String providerId;
    private String nickname;       // OAuth 제공자 닉네임 (원본 스냅샷)
    private String email;          // OAuth 제공자 이메일 (원본 스냅샷)
    private String profileImage;   // OAuth 제공자 프로필 이미지 (원본 스냅샷)
    private String ageRange;       // OAuth 제공자 연령대. 계속 수집(결정 유지) — 쓰는 화면은 없음

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
