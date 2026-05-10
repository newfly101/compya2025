package com.dawne.com2usbaseball.domain.oauth.dto.response;

/** access (JWT) + refresh (opaque) 한 쌍 */
public record AuthTokens(String accessToken, String refreshToken) {}
