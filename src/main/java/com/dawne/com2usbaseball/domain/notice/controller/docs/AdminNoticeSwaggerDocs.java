package com.dawne.com2usbaseball.domain.notice.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.notice.dto.request.ChangeNoticePinnedRequest;
import com.dawne.com2usbaseball.domain.notice.dto.request.ChangeNoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.request.ChangeNoticeVisibleRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.enums.NoticeMessages;
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

@Tag(name = "1. [Site] Notice", description = "관리자 공지사항 관리 API")
public interface AdminNoticeSwaggerDocs {

    @Operation(
            summary = "관리자 공지사항 목록 조회",
            description = "관리자가 전체 공지사항 목록을 조회합니다. 비노출 공지사항도 포함됩니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "공지사항 목록 조회 성공"
            )
    })
    ListResponse<NoticeResponse> getAdminNoticeList();

    @Operation(
            summary = "관리자 공지사항 상세 조회",
            description = "관리자가 특정 공지사항의 상세 정보를 조회합니다."
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
    NoticeResponse getAdminNoticeDetail(
            @Parameter(description = "공지사항 ID", example = "1")
            @PathVariable Long noticeId
    );

    @Operation(
            summary = "관리자 공지사항 등록",
            description = "관리자가 공지사항을 등록합니다. source 값에 따라 INTERNAL은 content 필수, EXTERNAL은 externalUrl 필수입니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "공지사항 등록 성공"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 데이터"
            )
    })
    OperationResponse<NoticeMessages> createNotice(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "공지사항 등록 요청",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = ChangeNoticeRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "내부 공지 등록 예시",
                                            value = """
                                                    {
                                                      "source": "INTERNAL",
                                                      "title": "4월 점검 안내",
                                                      "summary": "정기 점검 예정",
                                                      "content": "4월 10일 02:00 ~ 05:00 점검이 진행됩니다.",
                                                      "externalUrl": null,
                                                      "isVisible": true,
                                                      "isPinned": false,
                                                      "publishedAt": "2026-04-05 10:00"
                                                    }
                                                    """
                                    ),
                                    @ExampleObject(
                                            name = "외부 공지 등록 예시",
                                            value = """
                                                    {
                                                      "source": "EXTERNAL",
                                                      "title": "공식 카페 이벤트 공지",
                                                      "summary": "외부 링크 안내",
                                                      "content": null,
                                                      "externalUrl": "https://cafe.naver.com/example/123",
                                                      "isVisible": true,
                                                      "isPinned": true,
                                                      "publishedAt": "2026-04-05 10:00"
                                                    }
                                                    """
                                    )
                            }
                    )
            )
            @RequestBody ChangeNoticeRequest request
    );

    @Operation(
            summary = "관리자 공지사항 수정",
            description = "관리자가 특정 공지사항을 수정합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "공지사항 수정 성공"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "잘못된 요청 데이터"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "공지사항을 찾을 수 없음"
            )
    })
    OperationResponse<NoticeMessages> updateNotice(
            @Parameter(description = "공지사항 ID", example = "1")
            @PathVariable Long noticeId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "공지사항 수정 요청",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = ChangeNoticeRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "내부 공지 수정 예시",
                                            value = """
                                                    {
                                                      "source": "INTERNAL",
                                                      "title": "4월 점검 일정 변경 안내",
                                                      "summary": "점검 시간 변경",
                                                      "content": "4월 10일 03:00 ~ 06:00 점검으로 변경되었습니다.",
                                                      "externalUrl": null,
                                                      "isVisible": true,
                                                      "isPinned": true,
                                                      "publishedAt": "2026-04-06 09:00"
                                                    }
                                                    """
                                    )
                            }
                    )
            )
            @RequestBody ChangeNoticeRequest request
    );

    @Operation(
            summary = "관리자 공지사항 노출 여부 변경",
            description = "관리자가 특정 공지사항의 사용자 노출 여부를 변경합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "공지사항 노출 여부 변경 성공"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "공지사항을 찾을 수 없음"
            )
    })
    OperationResponse<NoticeMessages> updateNoticeVisible(
            @Parameter(description = "공지사항 ID", example = "1")
            @PathVariable Long noticeId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "노출 여부 변경 요청",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = ChangeNoticeVisibleRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "노출 숨김 예시",
                                            value = """
                                                    {
                                                      "isVisible": false
                                                    }
                                                    """
                                    )
                            }
                    )
            )
            @RequestBody ChangeNoticeVisibleRequest request
    );

    @Operation(
            summary = "관리자 공지사항 상단 고정 여부 변경",
            description = "관리자가 특정 공지사항의 상단 고정 여부를 변경합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "공지사항 상단 고정 여부 변경 성공"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "공지사항을 찾을 수 없음"
            )
    })
    OperationResponse<NoticeMessages> updateNoticePinned(
            @Parameter(description = "공지사항 ID", example = "1")
            @PathVariable Long noticeId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "상단 고정 여부 변경 요청",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = ChangeNoticePinnedRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "상단 고정 예시",
                                            value = """
                                                    {
                                                      "isPinned": true
                                                    }
                                                    """
                                    )
                            }
                    )
            )
            @RequestBody ChangeNoticePinnedRequest request
    );

    @Operation(
            summary = "관리자 공지사항 삭제",
            description = "관리자가 특정 공지사항을 삭제합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "공지사항 삭제 성공"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "공지사항을 찾을 수 없음"
            )
    })
    OperationResponse<NoticeMessages> deleteNotice(
            @Parameter(description = "공지사항 ID", example = "1")
            @PathVariable Long noticeId
    );
}
