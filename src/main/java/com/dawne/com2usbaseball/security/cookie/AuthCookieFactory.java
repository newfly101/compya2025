package com.dawne.com2usbaseball.security.cookie;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthCookieFactory {

    public static final String ACCESS_TOKEN = "ACCESS_TOKEN";
    public static final String REFRESH_TOKEN = "REFRESH_TOKEN";

    /** refresh cookie 는 /api/auth 경로에만 노출 (refresh + logout endpoint 한정) */
    private static final String REFRESH_COOKIE_PATH = "/api/auth";

    public ResponseCookie createAccessToken(String token, HttpServletRequest request) {
        return applyEnvOptions(
                ResponseCookie.from(ACCESS_TOKEN, token)
                        .httpOnly(true)
                        .path("/"),
                request
        ).build();
    }

    public ResponseCookie expireAccessToken(HttpServletRequest request) {
        return applyEnvOptions(
                ResponseCookie.from(ACCESS_TOKEN, "")
                        .httpOnly(true)
                        .path("/")
                        .maxAge(0),
                request
        ).build();
    }

    public ResponseCookie createRefreshToken(String token, Duration ttl, HttpServletRequest request) {
        return applyEnvOptions(
                ResponseCookie.from(REFRESH_TOKEN, token)
                        .httpOnly(true)
                        .path(REFRESH_COOKIE_PATH)
                        .maxAge(ttl),
                request
        ).build();
    }

    public ResponseCookie expireRefreshToken(HttpServletRequest request) {
        return applyEnvOptions(
                ResponseCookie.from(REFRESH_TOKEN, "")
                        .httpOnly(true)
                        .path(REFRESH_COOKIE_PATH)
                        .maxAge(0),
                request
        ).build();
    }

    private ResponseCookie.ResponseCookieBuilder applyEnvOptions(
            ResponseCookie.ResponseCookieBuilder builder,
            HttpServletRequest request
    ) {
        if (isLocalhost(request)) {
            return builder
                    .secure(false)
                    .sameSite("Lax");
        }

        return builder
                .secure(true)
                .sameSite("None")
                .domain(".compyafun.com");
    }

    private boolean isLocalhost(HttpServletRequest request) {
        String host = request.getServerName();
        return host.equals("localhost") || host.equals("127.0.0.1");
    }
}
