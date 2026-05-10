package com.dawne.com2usbaseball.domain.admin.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.security.cookie.AuthCookieFactory;
import com.dawne.com2usbaseball.security.provider.JwtProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "0. Swagger 인증", description = "Swagger UI 에서 admin endpoint 테스트용. 로컬 한정.")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dev")
@Profile("local")
public class SwaggerController {

    private final JwtProvider jwtProvider;
    private final AuthCookieFactory authCookieFactory;

    @Operation(summary = "ADMIN 토큰 cookie 발급", description = "Try it out 한 번 호출 → ACCESS_TOKEN cookie 자동 저장")
    @GetMapping("/test-token")
    public ResponseEntity<GlobalResponse<String>> getTestToken(HttpServletRequest request) {
        String token = jwtProvider.createAccessToken(1L, "ADMIN");
        ResponseCookie cookie = authCookieFactory.createAccessToken(token, request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(GlobalResponse.success("ADMIN cookie 발급 완료. 이후 admin endpoint 호출 시 cookie 자동 전송."));
    }

    @Operation(summary = "ACCESS_TOKEN cookie 만료", description = "테스트 세션 종료용")
    @GetMapping("/logout")
    public ResponseEntity<GlobalResponse<String>> logout(HttpServletRequest request) {
        ResponseCookie cookie = authCookieFactory.expireAccessToken(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(GlobalResponse.success("ACCESS_TOKEN cookie 만료 처리됨."));
    }
}
