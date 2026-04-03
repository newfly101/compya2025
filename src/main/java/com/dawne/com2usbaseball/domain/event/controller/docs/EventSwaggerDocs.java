package com.dawne.com2usbaseball.domain.event.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "1. [Site] Event", description = "사용자 이벤트 조회 API")
public interface EventSwaggerDocs {

    @Operation(
            summary = "이벤트 목록 조회",
            description = "사용자에게 노출되는 이벤트 목록을 조회한다."
    )
    @ApiResponse(responseCode = "200", description = "이벤트 목록 조회 성공")
    ListResponse<EventResponse> getExternalEventList();
}
