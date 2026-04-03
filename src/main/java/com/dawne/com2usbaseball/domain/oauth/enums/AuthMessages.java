package com.dawne.com2usbaseball.domain.oauth.enums;

public enum AuthMessages {
    AUTH_CREATED,
    AUTH_UPDATED,
    AUTH_VISIBLE_UPDATED,
    AUTH_DELETED,
    AUTH_FAILED,


    AUTH_UNAUTHORIZED,        // 비 인가
    AUTH_USER_NOT_FOUND,      // 유저 없음
    AUTH_USER_BLOCKED,        // 차단/정지/탈퇴
    AUTH_NAVER_TOKEN_FAILED   // 네이버 토큰 발급 실패
}
