package com.dawne.com2usbaseball.domain.oauth.dto.response;

import com.dawne.com2usbaseball.domain.oauth.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record UserMeResponse(
        String publicId,           // 밖으로 노출되는 식별자. 어드민 화면 등에서 "이 줄이 나 자신인가" 판정에 쓰인다
        String nickname,
        String email,
        String profileImage,       // 사용자가 직접 올린 프로필 이미지. 없으면 null
        String oauthProfileImage,  // 네이버 제공 이미지(참고/기본값 용도). 화면은 profileImage 가 null 일 때 이 값을 대신 쓸 수 있다
        UserRole userRole,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime lastLoginAt
) {}
