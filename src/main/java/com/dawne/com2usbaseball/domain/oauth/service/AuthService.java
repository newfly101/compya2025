package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.domain.oauth.dto.response.AuthTokens;

public interface AuthService {

    /** 네이버 OAuth 로그인 → access + refresh 발급, refresh 는 DB 저장 */
    AuthTokens loginWithNaver(String code, String state);

    /** 유효한 refresh token 으로 access + refresh 재발급 (rotation). 기존 refresh 는 무효 */
    AuthTokens refresh(String rawRefreshToken);

    /** refresh token 무효화 (DB 삭제). null/blank 면 no-op */
    void logout(String rawRefreshToken);
}
