package com.dawne.com2usbaseball.domain.notice.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Tag(name = "1. [Site] Notice", description = "공지사항 조회 API")
public interface NoticeSwaggerDocs {

    @Operation(
            summary = "공지사항 목록 조회",
            description = "사용자에게 노출 가능한 공지사항 목록을 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "공지사항 목록 조회 성공"
            )
    })
    GlobalResponse<List<NoticeResponse>> getNoticeList();

    @Operation(
            summary = "공지사항 상세 조회",
            description = "사용자에게 노출 가능한 특정 공지사항의 상세 정보를 조회합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "공지사항 상세 조회 성공"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "공지사항을 찾을 수 없음"
            )
    })
    GlobalResponse<NoticeResponse> getNoticeDetail(
            @Parameter(description = "공지사항 ID", example = "1")
            @PathVariable Long noticeId
    );
}
