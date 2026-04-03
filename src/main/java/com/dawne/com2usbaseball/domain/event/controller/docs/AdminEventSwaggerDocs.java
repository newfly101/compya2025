package com.dawne.com2usbaseball.domain.event.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.event.dto.request.ChangeEventRequest;
import com.dawne.com2usbaseball.domain.event.dto.request.ChangeEventVisibleRequest;
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

@Tag(name = "1. [Site] Event", description = "관리자 이벤트 관리 API")
public interface AdminEventSwaggerDocs {

    @Operation(
            summary = "이벤트 목록 조회",
            description = "관리자가 등록된 이벤트 목록을 조회한다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 목록 조회 성공")
    ListResponse<EventResponse> getExternalEventList();

    @Operation(
            summary = "이벤트 등록",
            description = "관리자가 신규 이벤트를 등록한다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 등록 성공")
    @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content)
    OperationResponse<EventMessages> insertNewEvent(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "이벤트 등록 요청 값",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = ChangeEventRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "이벤트 등록 예시",
                                            summary = "신규 이벤트 등록 샘플",
                                            value = """
                                                {
                                                  "eventType": "OFFICIAL",
                                                  "title": "2026 시즌 개막 기념 이벤트",
                                                  "startAt": "2026-03-26T12:00:00",
                                                  "expireAt": "2026-07-04T23:59:00",
                                                  "imageUrl": "https://compyafun.com/uploads/images/sample.png",
                                                  "externalLink": "https://cafe.naver.com/com2usbaseball2015/1956342",
                                                  "visible": true
                                                }
                                                """
                                    )
                            }
                    )
            )
            @RequestBody ChangeEventRequest request
    );

    @Operation(
            summary = "이벤트 수정",
            description = "관리자가 기존 이벤트 정보를 수정한다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 수정 성공")
    @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음", content = @Content)
    OperationResponse<EventMessages> updateExternalEvent(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "이벤트 수정 요청 값",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = ChangeEventRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "이벤트 수정 예시",
                                            summary = "이벤트 정보 수정 샘플",
                                            value = """
                                                {
                                                  "eventType": "OFFICIAL",
                                                  "title": "2026 시즌 개막 이벤트 (수정)",
                                                  "startAt": "2026-03-26T12:00:00",
                                                  "expireAt": "2026-08-01T23:59:00",
                                                  "imageUrl": "https://compyafun.com/uploads/images/sample-update.png",
                                                  "externalLink": "https://cafe.naver.com/com2usbaseball2015/1956342",
                                                  "visible": true
                                                }
                                                """
                                    )
                            }
                    )
            )
            @RequestBody ChangeEventRequest request,

            @Parameter(description = "이벤트 ID", required = true, example = "1")
            @PathVariable Long id
    );

    @Operation(
            summary = "이벤트 노출 여부 수정",
            description = "관리자가 이벤트의 노출 여부를 변경한다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 노출 여부 수정 성공")
    @ApiResponse(responseCode = "404", description = "이벤트를 찾을 수 없음", content = @Content)
    OperationResponse<EventMessages> updateExternalEventVisible(
            @Parameter(description = "이벤트 ID", required = true, example = "1")
            @PathVariable Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "이벤트 노출 여부 변경 요청 값",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = ChangeEventVisibleRequest.class),
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
            @RequestBody ChangeEventVisibleRequest request
    );
}
