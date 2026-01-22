package com.dawne.com2usbaseball.controller.auth;

import com.dawne.com2usbaseball.dto.response.oauth.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.entity.UserEntity;
import com.dawne.com2usbaseball.utils.JwtProvider;
import com.dawne.com2usbaseball.service.user.NaverOAuthService;
import com.dawne.com2usbaseball.service.user.UserService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService service;
    private final NaverOAuthService naverOAuthService;
    private final JwtProvider jwtProvider;

    @GetMapping("/naver/callback")
    public void naverCallback(@RequestParam String code,
                              @RequestParam String state,
                              HttpServletResponse response
    ) throws IOException {

        NaverOAuthUserResponse userInfo = naverOAuthService.getUserInfo(code, state);
        UserEntity user = service.findOrCreateNaverUser(userInfo);

        String jwt = jwtProvider.createAccessToken(user.getId());

        response.sendRedirect(
                "https://compyafun.com/auth/callback?token=" + jwt
        );
    }

}
