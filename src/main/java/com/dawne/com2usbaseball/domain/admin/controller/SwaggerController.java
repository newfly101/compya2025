package com.dawne.com2usbaseball.domain.admin.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
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

    @GetMapping("/test-token")
    public GlobalResponse<String> getTestToken() {
        String token = jwtProvider.createAccessToken(1L, "ADMIN");
        return GlobalResponse.success(token);
    }
}
