package com.dawne.com2usbaseball.domain.oauth.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.oauth.controller.docs.AuthSwaggerDocs;
import com.dawne.com2usbaseball.domain.oauth.dto.response.AuthTokens;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.domain.oauth.service.AuthService;
import com.dawne.com2usbaseball.security.cookie.AuthCookieFactory;
import com.dawne.com2usbaseball.security.provider.AuthRedirectProvider;
import com.dawne.com2usbaseball.security.provider.JwtProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController implements AuthSwaggerDocs {

    private final AuthService authService;
    private final AuthCookieFactory cookieFactory;
    private final AuthRedirectProvider redirectProvider;
    private final JwtProvider jwtProvider;

    /**
     * 네이버 로그인 콜백
     */
    @Override
    @GetMapping("/naver/callback")
    public void naverCallback(@RequestParam String code,
                              @RequestParam String state,
                              HttpServletResponse response,
                              HttpServletRequest request
    ) throws IOException {

        AuthTokens tokens = authService.loginWithNaver(code, state);
        writeAuthCookies(tokens, response, request);

        String url = redirectProvider.setRedirectUrl(request);
        response.sendRedirect(url);
    }

    /**
     * Refresh — refresh cookie 검증 + access/refresh 재발급 (rotation)
     */
    @Override
    @PostMapping("/refresh")
    public GlobalResponse<Void> refresh(HttpServletRequest request, HttpServletResponse response) {
        String raw = readCookie(request, AuthCookieFactory.REFRESH_TOKEN);
        AuthTokens tokens = authService.refresh(raw);
        writeAuthCookies(tokens, response, request);
        return GlobalResponse.success(AuthMessages.AUTH_SUCCESS, null);
    }

    /**
     * 로그아웃 — refresh DB row 삭제 + 양쪽 쿠키 만료
     */
    @Override
    @PostMapping("/logout")
    public GlobalResponse<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String raw = readCookie(request, AuthCookieFactory.REFRESH_TOKEN);
        authService.logout(raw);

        response.addHeader(HttpHeaders.SET_COOKIE, cookieFactory.expireAccessToken(request).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookieFactory.expireRefreshToken(request).toString());
        return GlobalResponse.success(AuthMessages.AUTH_LOGOUT_SUCCESS, null);
    }

    private void writeAuthCookies(AuthTokens tokens, HttpServletResponse response, HttpServletRequest request) {
        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookieFactory.createAccessToken(tokens.accessToken(), request).toString()
        );
        response.addHeader(
                HttpHeaders.SET_COOKIE,
                cookieFactory.createRefreshToken(tokens.refreshToken(), jwtProvider.getRefreshTokenTtl(), request).toString()
        );
    }

    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
