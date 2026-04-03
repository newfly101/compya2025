package com.dawne.com2usbaseball.domain.oauth.controller.docs;

import com.dawne.com2usbaseball.domain.oauth.dto.response.UserMeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;

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
                                  "code": "COMMON_200",
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
    UserMeResponse getMe(HttpServletRequest request);
}
