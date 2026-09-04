package com.dawne.com2usbaseball.domain.event.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.BulkIdsRequest;
import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
import com.dawne.com2usbaseball.common.support.dto.BulkVisibleRequest;
import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.event.dto.request.EventAdminListRequest;
import com.dawne.com2usbaseball.domain.event.dto.request.EventRequest;
import com.dawne.com2usbaseball.domain.event.dto.request.EventVisibleRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "1. [Site] Event", description = "관리자 이벤트 관리 API")
public interface AdminEventSwaggerDocs {

    @Operation(
            summary = "이벤트 목록 조회 (외부전용 — legacy)",
            description = "관리자가 등록된 이벤트 목록을 조회한다. (기존 /external)"
    )
    @ApiResponse(responseCode = "200", description = "이벤트 목록 조회 성공")
    GlobalResponse<List<EventResponse>> getExternalEventList();

    @Operation(
            summary = "이벤트 전체 목록 조회 (관리자)",
            description = "관리자가 전체 이벤트 목록을 필터 조건으로 조회한다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 전체 목록 조회 성공")
    GlobalResponse<List<EventResponse>> getAdminEventList(EventAdminListRequest request);

    @Operation(
            summary = "이벤트 등록",
            description = "관리자가 신규 이벤트를 등록한다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 등록 성공")
    @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content)
    GlobalResponse<EventResponse> insertNewEvent(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "이벤트 등록 요청 값",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = EventRequest.class),
                            examples = @ExampleObject(
                                    name = "이벤트 등록 예시",
                                    summary = "신규 이벤트 등록 샘플",
                                    value = """
                                        {
                                          "eventType": "OFFICIAL",
                                          "title": "2026 시즌 개막 기념 이벤트",
                                          "startAt": "2026-03-26 12:00:00",
                                          "expireAt": "2026-07-04 23:59:00",
                                          "imageUrl": "https://compyafun.com/uploads/images/sample.png",
                                          "externalLink": "https://cafe.naver.com/com2usbaseball2015/1956342",
                                          "visible": true
                                        }
                                        """
                            )
                    )
            )
            @RequestBody EventRequest request
    );

    @Operation(
            summary = "이벤트 수정",
            description = "관리자가 기존 이벤트 정보를 수정한다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 수정 성공")
    @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음", content = @Content)
    GlobalResponse<EventResponse> updateExternalEvent(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "이벤트 수정 요청 값",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = EventRequest.class),
                            examples = @ExampleObject(
                                    name = "이벤트 수정 예시",
                                    summary = "이벤트 정보 수정 샘플",
                                    value = """
                                        {
                                          "eventType": "OFFICIAL",
                                          "title": "2026 시즌 개막 이벤트 (수정)",
                                          "startAt": "2026-03-26 12:00:00",
                                          "expireAt": "2026-08-01 23:59:00",
                                          "imageUrl": "https://compyafun.com/uploads/images/sample-update.png",
                                          "externalLink": "https://cafe.naver.com/com2usbaseball2015/1956342",
                                          "visible": true
                                        }
                                        """
                            )
                    )
            )
            @RequestBody EventRequest request,

            @Parameter(description = "이벤트 ID", required = true, example = "1")
            @PathVariable Long id
    );

    @Operation(
            summary = "이벤트 노출 여부 수정",
            description = "관리자가 이벤트의 노출 여부를 변경한다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 노출 여부 수정 성공")
    @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음", content = @Content)
    GlobalResponse<Void> updateExternalEventVisible(
            @Parameter(description = "이벤트 ID", required = true, example = "1")
            @PathVariable Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "이벤트 노출 여부 변경 요청 값",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = EventVisibleRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "노출 여부 변경 예시",
                                            summary = "visible 변경 샘플",
                                            value = """
                                                {
                                                  "visible": false
                                                }
                                                """
                                    )
                            }
                    )
            )
            @RequestBody EventVisibleRequest request
    );

    @Operation(
            summary = "이벤트 삭제",
            description = "관리자가 이벤트를 삭제한다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 삭제 성공")
    @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음", content = @Content)
    GlobalResponse<Void> deleteEvent(
            @Parameter(description = "이벤트 ID", required = true, example = "1")
            @PathVariable Long id
    );

    @Operation(
            summary = "이벤트 일괄 삭제",
            description = "관리자가 여러 이벤트를 한 번에 삭제한다. 존재하지 않는 id는 failedIds로 반환되며 전체 요청은 실패하지 않는다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 일괄 삭제 처리 완료")
    GlobalResponse<BulkOperationResponse> bulkDeleteEvents(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "삭제할 이벤트 id 목록",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = BulkIdsRequest.class),
                            examples = @ExampleObject(value = "{ \"ids\": [1, 2, 3] }")
                    )
            )
            @RequestBody BulkIdsRequest request
    );

    @Operation(
            summary = "이벤트 일괄 노출 여부 변경",
            description = "관리자가 여러 이벤트의 노출 여부를 한 번에 변경한다. 존재하지 않는 id는 failedIds로 반환되며 전체 요청은 실패하지 않는다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 일괄 노출 여부 변경 처리 완료")
    GlobalResponse<BulkOperationResponse> bulkUpdateEventsVisible(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "노출 여부를 변경할 이벤트 id 목록과 변경값",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = BulkVisibleRequest.class),
                            examples = @ExampleObject(value = "{ \"ids\": [1, 2, 3], \"visible\": false }")
                    )
            )
            @RequestBody BulkVisibleRequest request
    );
}
