package com.dawne.com2usbaseball.domain.oauth.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.config.properties.NaverOauthProperties;
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
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController implements AuthSwaggerDocs {

    private final AuthService authService;
    private final AuthCookieFactory cookieFactory;
    private final AuthRedirectProvider redirectProvider;
    private final JwtProvider jwtProvider;
    private final NaverOauthProperties naverProperties;

    /**
     * 네이버 로그인 시작 — state 를 발급해 쿠키에 심고 네이버 인가 화면으로 보낸다.
     * state 를 서버가 만들어야 콜백에서 대조가 가능하다 (로그인 CSRF 방어).
     */
    @Override
    @GetMapping("/naver/login")
    public void naverLogin(HttpServletResponse response, HttpServletRequest request) throws IOException {
        String state = UUID.randomUUID().toString();
        response.addHeader(HttpHeaders.SET_COOKIE, cookieFactory.createOAuthState(state, request).toString());

        response.sendRedirect("https://nid.naver.com/oauth2.0/authorize"
                + "?response_type=code"
                + "&client_id=" + naverProperties.getClientId()
                + "&redirect_uri=" + URLEncoder.encode(naverProperties.getRedirectUri(), StandardCharsets.UTF_8)
                + "&state=" + state);
    }

    /**
     * 네이버 로그인 콜백
     */
    @Override
    @GetMapping("/naver/callback")
    public void naverCallback(@RequestParam(required = false) String code,
                              @RequestParam(required = false) String state,
                              HttpServletResponse response,
                              HttpServletRequest request
    ) throws IOException {

        try {
            verifyState(state, request, response);
            if (code == null) {
                throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
            }

            AuthTokens tokens = authService.loginWithNaver(code, state);
            writeAuthCookies(tokens, response, request);

            String url = redirectProvider.setRedirectUrl(request);
            response.sendRedirect(url);
        } catch (BaseException e) {
            // 실패도 성공 경로와 동일하게 프론트로 리다이렉트 — 오류 코드만 쿼리로 얹는다 (JSON 원문 노출 방지)
            String url = redirectProvider.setRedirectUrl(request) + "?error=" + e.getCode().name();
            response.sendRedirect(url);
        }
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

    /** 쿠키에 심어둔 state 와 콜백으로 되돌아온 state 대조. 1회용이므로 성공/실패 무관하게 즉시 삭제한다. */
    private void verifyState(String state, HttpServletRequest request, HttpServletResponse response) {
        String issued = readCookie(request, AuthCookieFactory.OAUTH_STATE);
        response.addHeader(HttpHeaders.SET_COOKIE, cookieFactory.expireOAuthState(request).toString());

        if (issued == null || !issued.equals(state)) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }
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
