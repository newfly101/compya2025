package com.dawne.com2usbaseball.domain.oauth.controller;

import com.dawne.com2usbaseball.security.cookie.AuthCookieFactory;
import com.dawne.com2usbaseball.security.provider.AuthRedirectProvider;
import com.dawne.com2usbaseball.domain.oauth.dto.response.AuthHealthResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.response.UserHealthResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.response.UserRoleResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.entity.UserRoleEntity;
import com.dawne.com2usbaseball.security.provider.JwtProvider;
import com.dawne.com2usbaseball.domain.oauth.service.support.NaverOAuthService;
import com.dawne.com2usbaseball.domain.oauth.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService service;
    private final NaverOAuthService naverOAuthService;
    private final JwtProvider jwtProvider;
    private final AuthCookieFactory cookieFactory;
    private final AuthRedirectProvider redirectProvider;

    @GetMapping("/naver/callback")
    public void naverCallback(@RequestParam String code,
                              @RequestParam String state,
                              HttpServletResponse response,
                              HttpServletRequest request
    ) throws IOException {

        NaverOAuthUserResponse userInfo = naverOAuthService.getUserInfo(code, state);
        UserEntity user = service.findOrCreateNaverUser(userInfo);

        String jwt = jwtProvider.createAccessToken(user.getId());

        String cookie = cookieFactory.createAccessToken(jwt, request).toString();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie);

        // 환경 별로 redirect 경로 분기 함수
        String url = redirectProvider.setRedirectUrl(request);

        response.sendRedirect(url);
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response, HttpServletRequest request) {
        String cookie = cookieFactory.expireAccessToken(request).toString();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie);
    }

    @GetMapping("/health")
    public ResponseEntity<AuthHealthResponse> health(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.ok(
                    new AuthHealthResponse(false, null, null)
            );
        }

        UserEntity user = service.findActiveUserById(userId);
        UserRoleEntity role = service.findUserRoleByUserId(userId);

        return ResponseEntity.ok(
                new AuthHealthResponse(
                        true,
                        new UserHealthResponse(
                                user.getId(),
                                user.getNickname(),
                                user.getOauthEmail(),
                                user.getOauthProfileImage(),
                                user.getLastLoginAt()
                        ),
                        new UserRoleResponse(
                                role.getRole(),
                                role.getStatus(),
                                role.getBanReason(),
                                role.getUpdatedAt()
                        )

                )
        );
    }

}
