package com.dawne.com2usbaseball.domain.quiz.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.BulkIdsRequest;
import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.quiz.dto.request.QuizRequest;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "[fun] Admin Quiz", description = "관리자 퀴즈 관리 API")
public interface AdminQuizSwaggerDocs {

    @Operation(
        summary = "관리자 퀴즈 목록 조회",
        description = "관리자가 전체 퀴즈 목록을 최신순으로 조회합니다. 노출 여부와 관계없이 전체가 포함됩니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "퀴즈 목록 조회 성공"
        )
    })
    GlobalResponse<List<QuizResponse>> getAll();

    @Operation(
        summary = "관리자 퀴즈 등록",
        description = "관리자가 새 퀴즈를 등록합니다. round는 회차 번호, imageUrl은 퀴즈 이미지 경로입니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "퀴즈 등록 성공"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "퀴즈 등록 실패"
        )
    })
    GlobalResponse<QuizResponse> create(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "퀴즈 등록 요청",
            required = true,
            content = @Content(
                schema = @Schema(implementation = QuizRequest.class),
                examples = {
                    @ExampleObject(
                        name = "퀴즈 등록 예시",
                        value = """
                            {
                              "round": 1,
                              "imageUrl": "https://cdn.example.com/quiz/round1.png"
                            }
                            """
                    )
                }
            )
        )
        @RequestBody QuizRequest request
    );

    @Operation(
        summary = "관리자 퀴즈 수정",
        description = "관리자가 특정 퀴즈를 수정합니다. 모든 필드를 함께 전달해야 합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "퀴즈 수정 성공"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "퀴즈를 찾을 수 없음"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "퀴즈 수정 실패"
        )
    })
    GlobalResponse<QuizResponse> update(
        @Parameter(description = "퀴즈 ID", example = "1")
        @PathVariable Long id,

        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "퀴즈 수정 요청",
            required = true,
            content = @Content(
                schema = @Schema(implementation = QuizRequest.class),
                examples = {
                    @ExampleObject(
                        name = "퀴즈 수정 예시",
                        value = """
                            {
                              "round": 1,
                              "imageUrl": "https://cdn.example.com/quiz/round1-updated.png"
                            }
                            """
                    )
                }
            )
        )
        @RequestBody QuizRequest request
    );

    @Operation(
        summary = "관리자 퀴즈 삭제",
        description = "관리자가 특정 퀴즈를 삭제합니다."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "퀴즈 삭제 성공"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "퀴즈를 찾을 수 없음"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "퀴즈 삭제 실패"
        )
    })
    GlobalResponse<Void> delete(
        @Parameter(description = "퀴즈 ID", example = "1")
        @PathVariable Long id
    );

    @Operation(
        summary = "퀴즈 일괄 삭제",
        description = "관리자가 여러 퀴즈를 한 번에 삭제합니다. 존재하지 않는 id는 failedIds로 반환되며 전체 요청은 실패하지 않습니다."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "퀴즈 일괄 삭제 처리 완료")
    })
    GlobalResponse<BulkOperationResponse> bulkDelete(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "삭제할 퀴즈 id 목록",
            required = true,
            content = @Content(
                schema = @Schema(implementation = BulkIdsRequest.class),
                examples = @ExampleObject(value = "{ \"ids\": [1, 2, 3] }")
            )
        )
        @RequestBody BulkIdsRequest request
    );
}
