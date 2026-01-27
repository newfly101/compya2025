package com.dawne.com2usbaseball.controller.auth;

import com.dawne.com2usbaseball.controller.auth.support.AuthCookieFactory;
import com.dawne.com2usbaseball.controller.auth.support.AuthRedirectProvider;
import com.dawne.com2usbaseball.dto.response.oauth.AuthHealthResponse;
import com.dawne.com2usbaseball.dto.response.oauth.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.dto.response.oauth.UserHealthResponse;
import com.dawne.com2usbaseball.entity.UserEntity;
import com.dawne.com2usbaseball.utils.JwtProvider;
import com.dawne.com2usbaseball.service.user.NaverOAuthService;
import com.dawne.com2usbaseball.service.user.UserService;
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
        log.info("@@@@@@@@@@@@@@@@@@@@@@@@@@={}",url);

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
                    new AuthHealthResponse(false, null)
            );
        }

        UserEntity user = service.findActiveUserById(userId);

        return ResponseEntity.ok(
                new AuthHealthResponse(
                        true,
                        new UserHealthResponse(
                                user.getId(),
                                user.getNickname(),
                                user.getEmail(),
                                user.getProfileImage(),
                                user.getLastLoginAt()
                        )

                )
        );
    }

}
