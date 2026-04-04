package com.dawne.com2usbaseball.domain.quiz.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "2. [User] Quiz", description = "사용자 퀴즈 조회 API")
public interface QuizSwaggerDocs {

    @Operation(
        summary = "최신 퀴즈 조회",
        description = """
            현재 노출(isVisible=true) 중인 퀴즈 중 가장 최근 퀴즈를 반환합니다.
            노출 중인 퀴즈가 없으면 404를 반환하며, 프론트엔드는 이를 기준으로 퀴즈 영역을 숨김 처리합니다.
            """
)
@ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "최신 퀴즈 조회 성공"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "노출 중인 퀴즈 없음 — 프론트엔드에서 퀴즈 영역을 비노출 처리"
        )
    })
    GlobalResponse<QuizResponse> getLatest();
}
