package com.dawne.com2usbaseball.domain.oauth.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@Tag(name = "1. [Auth] 인증", description = "OAuth 로그인 / 리프레시 / 로그아웃 API")
public interface AuthSwaggerDocs {
    @Operation(
            summary = "네이버 로그인 콜백",
            description = "네이버 OAuth 인증 후 콜백. ACCESS_TOKEN(/) + REFRESH_TOKEN(/api/auth) 쿠키 설정 후 프론트로 리다이렉트."
    )
    @ApiResponse(responseCode = "302", description = "로그인 성공 - 프론트로 리다이렉트")
    @ApiResponse(responseCode = "502", description = "네이버 토큰 발급 실패")
    @ApiResponse(responseCode = "403", description = "차단/정지/탈퇴 사용자")
    void naverCallback(String code, String state,
                       HttpServletResponse response,
                       HttpServletRequest request) throws IOException;

    @Operation(
            summary = "토큰 리프레시",
            description = "REFRESH_TOKEN 쿠키 검증 후 access/refresh 재발급 (rotation). 기존 refresh 는 즉시 무효."
    )
    @ApiResponse(responseCode = "200", description = "재발급 성공")
    @ApiResponse(responseCode = "401", description = "refresh 없음/만료/무효")
    GlobalResponse<Void> refresh(HttpServletRequest request, HttpServletResponse response);

    @Operation(
            summary = "로그아웃",
            description = "DB 의 refresh token 행 삭제 + ACCESS/REFRESH 쿠키 만료."
    )
    @ApiResponse(responseCode = "200", description = "로그아웃 성공")
    GlobalResponse<Void> logout(HttpServletRequest request, HttpServletResponse response);
}
