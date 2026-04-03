package com.dawne.com2usbaseball.domain.admin.controller;

import com.dawne.com2usbaseball.security.provider.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@Tag(name="0. Swagger 인증", description = "Swagger 로그인 인증 토큰 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dev")
public class SwaggerController {

    private final JwtProvider jwtProvider;

    @GetMapping("/token")
    @Operation(summary = "JWT 토큰 발급", description="user_id = 1, user_role = ADMIN")
    public String getTestToken(@RequestParam Long userId, @RequestParam String userRole) {
        return jwtProvider.createAccessToken(userId, userRole);
    }
}
