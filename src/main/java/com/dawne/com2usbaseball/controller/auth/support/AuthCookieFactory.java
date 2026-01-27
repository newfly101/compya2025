package com.dawne.com2usbaseball.controller.auth.support;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieFactory {
    private static final String ACCESS_TOKEN = "ACCESS_TOKEN";

    public ResponseCookie createAccessToken(String token) {
        return ResponseCookie.from(ACCESS_TOKEN, token)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(".compyafun.com")
                .path("/")
                .build();
    }

    public ResponseCookie expireAccessToken() {
        return ResponseCookie.from(ACCESS_TOKEN, "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(".compyafun.com")
                .path("/")
                .maxAge(0)
                .build();
    }
}
