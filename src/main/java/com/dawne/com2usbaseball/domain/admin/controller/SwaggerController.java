package com.dawne.com2usbaseball.domain.admin.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.security.cookie.AuthCookieFactory;
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
@RequestMapping("/api/admin/dev")
@Profile("local")
public class SwaggerController {

    private final AuthCookieFactory authCookieFactory;

    // getTestToken(/test-token) 제거됨 — ADMIN 토큰을 발급하는 엔드포인트인데 자기 자신이
    // SecurityConfig 의 "/api/admin/**" → hasRole("ADMIN") 뒤에 있어 구조적으로 호출 불가능했다.
    // (docs/code-review-v1/admin/readme-verdict.md M3)

    @Operation(summary = "ACCESS_TOKEN cookie 만료", description = "테스트 세션 종료용")
    @GetMapping("/logout")
    public ResponseEntity<GlobalResponse<String>> logout(HttpServletRequest request) {
        ResponseCookie cookie = authCookieFactory.expireAccessToken(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(GlobalResponse.success("ACCESS_TOKEN cookie 만료 처리됨."));
    }
}
