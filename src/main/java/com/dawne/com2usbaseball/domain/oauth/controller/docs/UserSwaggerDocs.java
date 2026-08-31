package com.dawne.com2usbaseball.domain.oauth.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.oauth.dto.request.UserNicknameUpdateRequest;
import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@Tag(name = "1. [Auth] 유저", description = "유저 정보 API")
public interface UserSwaggerDocs {
    @Operation(
            summary = "내 정보 조회",
            description = "JWT 쿠키 기반으로 현재 로그인한 유저의 정보를 반환합니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "조회 성공",
            content = @Content(
                    schema = @Schema(implementation = UserMeResponse.class),
                    examples = @ExampleObject(
                            name = "응답 예시",
                            value = """
                                    {
                                      "success": true,
                                      "code": "AUTH_SUCCESS",
                                      "data": {
                                        "id": 1,
                                        "nickname": "dawne",
                                        "email": "dawne@naver.com",
                                        "profileImage": "https://example.com/image.jpg",
                                        "lastLoginAt": "2026-04-04 13:00"
                                      }
                                    }
                                    """
                    )
            )
    )
    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자", content = @Content)
    @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자", content = @Content)
    GlobalResponse<UserMeResponse> getMe(HttpServletRequest request);

    @Operation(
            summary = "내 정보 수정 (닉네임)",
            description = "서비스 닉네임(service_nickname)만 수정합니다. 네이버 제공 정보(oauthNickname 등)는 수정 대상이 아닙니다. " +
                    "닉네임은 중복을 허용하며, 최대 20자, 공백만 있는 값/빈 값은 거부됩니다. 앞뒤 공백은 trim 됩니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "수정 성공",
            content = @Content(
                    schema = @Schema(implementation = UserMeResponse.class),
                    examples = @ExampleObject(
                            name = "응답 예시",
                            value = """
                                    {
                                      "success": true,
                                      "code": "AUTH_NICKNAME_UPDATED",
                                      "data": {
                                        "id": 1,
                                        "nickname": "새닉네임",
                                        "email": "dawne@naver.com",
                                        "profileImage": "https://example.com/image.jpg",
                                        "lastLoginAt": "2026-04-04 13:00"
                                      }
                                    }
                                    """
                    )
            )
    )
    @ApiResponse(responseCode = "400", description = "닉네임 형식 오류 (빈 값/공백만/20자 초과)", content = @Content)
    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자", content = @Content)
    @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자", content = @Content)
    GlobalResponse<UserMeResponse> updateMe(HttpServletRequest request, @Valid UserNicknameUpdateRequest body);

    @Operation(
            summary = "회원 탈퇴",
            description = "로그인한 본인 계정을 탈퇴 처리합니다(소프트 삭제, user_status = WITHDRAWN). " +
                    "refresh token 을 무효화하고 access/refresh 쿠키를 만료시킵니다. " +
                    "탈퇴 후 1개월 이내 동일 계정으로 재로그인하면 자동으로 재활성화됩니다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "탈퇴 성공",
            content = @Content(
                    examples = @ExampleObject(
                            name = "응답 예시",
                            value = """
                                    {
                                      "success": true,
                                      "code": "AUTH_WITHDRAW_SUCCESS",
                                      "data": null
                                    }
                                    """
                    )
            )
    )
    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자", content = @Content)
    @ApiResponse(responseCode = "403", description = "이미 탈퇴/차단된 계정", content = @Content)
    @ApiResponse(responseCode = "404", description = "존재하지 않는 사용자", content = @Content)
    GlobalResponse<Void> deleteMe(HttpServletRequest request, HttpServletResponse response);
}
