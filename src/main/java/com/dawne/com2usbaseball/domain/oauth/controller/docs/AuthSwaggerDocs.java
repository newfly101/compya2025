package com.dawne.com2usbaseball.domain.oauth.controller.docs;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@Tag(name = "1. [Auth] 인증", description = "OAuth 로그인 / 로그아웃 API")
public interface AuthSwaggerDocs {
    @Operation(
            summary = "네이버 로그인 콜백",
            description = "네이버 OAuth 인증 후 콜백. JWT를 쿠키에 설정하고 프론트로 리다이렉트합니다."
    )
    @ApiResponse(responseCode = "302", description = "로그인 성공 - 프론트로 리다이렉트")
    @ApiResponse(responseCode = "502", description = "네이버 토큰 발급 실패")
    @ApiResponse(responseCode = "403", description = "차단/정지/탈퇴 사용자")
    void naverCallback(String code, String state,
                       HttpServletResponse response,
                       HttpServletRequest request) throws IOException;

    @Operation(
            summary = "로그아웃",
            description = "ACCESS_TOKEN 쿠키를 만료시킵니다. Stateless 방식이므로 서버 상태 변경 없음."
    )
    @ApiResponse(responseCode = "200", description = "로그아웃 성공 - 쿠키 만료")
    void logout(HttpServletResponse response, HttpServletRequest request);
}
