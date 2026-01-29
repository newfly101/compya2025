package com.dawne.com2usbaseball.security.cookie;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieFactory {
    private static final String ACCESS_TOKEN = "ACCESS_TOKEN";

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
