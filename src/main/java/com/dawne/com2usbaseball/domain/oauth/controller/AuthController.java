package com.dawne.com2usbaseball.domain.oauth.controller;

import com.dawne.com2usbaseball.domain.oauth.controller.docs.AuthSwaggerDocs;
import com.dawne.com2usbaseball.domain.oauth.service.AuthService;
import com.dawne.com2usbaseball.security.cookie.AuthCookieFactory;
import com.dawne.com2usbaseball.security.provider.AuthRedirectProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/auth")
public class AuthController implements AuthSwaggerDocs {

    private final AuthService authService;
    private final AuthCookieFactory cookieFactory;
    private final AuthRedirectProvider redirectProvider;

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

        String jwt = authService.loginWithNaver(code, state);

        String cookie = cookieFactory.createAccessToken(jwt, request).toString();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie);

        String url = redirectProvider.setRedirectUrl(request);
        response.sendRedirect(url);
    }

    /**
     * 로그아웃 (stateless → 쿠키 제거)
     */
    @Override
    @PostMapping("/logout")
    public void logout(HttpServletResponse response, HttpServletRequest request) {
        String cookie = cookieFactory.expireAccessToken(request).toString();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie);
    }
}
