package com.dawne.com2usbaseball.domain.oauth.enums;

public enum AuthMessages {
    // 조회/로그인 성공 응답
    AUTH_SUCCESS,
    // 인가 실패
    AUTH_UNAUTHORIZED,
    // 권한 부족 (계정은 정상, 접근 권한만 없음 — 차단/정지와 구분)
    AUTH_FORBIDDEN,
    // 유저 없음
    AUTH_USER_NOT_FOUND,
    // 유저 차단됨
    AUTH_USER_BLOCKED,
    // 추가: WITHDRAWN / SUSPENDED 상태 구분이 필요할 경우
    AUTH_USER_INACTIVE,
    // 네이버 인증 실패
    AUTH_NAVER_TOKEN_FAILED,
    // 같은 소셜 계정으로 동시에 첫 로그인 — 한쪽만 가입되고 나머지는 다시 로그인하면 된다
    AUTH_SIGNUP_CONFLICT,
    // refresh token 없음/위변조
    AUTH_REFRESH_TOKEN_INVALID,
    // refresh token 만료/revoke
    AUTH_REFRESH_TOKEN_EXPIRED,
    // 로그아웃 성공
    AUTH_LOGOUT_SUCCESS,
    // 닉네임 수정 성공
    AUTH_NICKNAME_UPDATED,
    // 닉네임 형식 오류 (빈 값/공백만/20자 초과)
    AUTH_INVALID_NICKNAME,
    // 프로필 이미지 주소 오류 (우리 업로드 경로가 아닌 임의의 URL)
    AUTH_INVALID_PROFILE_IMAGE,
    // 회원 탈퇴 성공
    AUTH_WITHDRAW_SUCCESS
}
