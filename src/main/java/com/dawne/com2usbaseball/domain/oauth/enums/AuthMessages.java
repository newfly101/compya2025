package com.dawne.com2usbaseball.domain.oauth.enums;

public enum AuthMessages {
    // 조회/로그인 성공 응답
    AUTH_SUCCESS,
    // 인가 실패
    AUTH_UNAUTHORIZED,
    // 유저 없음
    AUTH_USER_NOT_FOUND,
    // 유저 차단됨
    AUTH_USER_BLOCKED,
    // 추가: WITHDRAWN / SUSPENDED 상태 구분이 필요할 경우
    AUTH_USER_INACTIVE,
    // 네이버 인증 실패
    AUTH_NAVER_TOKEN_FAILED
}
