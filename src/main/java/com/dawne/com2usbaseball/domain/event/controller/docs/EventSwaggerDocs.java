package com.dawne.com2usbaseball.domain.event.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@Tag(name = "1. [Site] Event", description = "사용자 이벤트 조회 API")
public interface EventSwaggerDocs {

    @Operation(
            summary = "이벤트 목록 조회",
            description = "사용자에게 노출되는 이벤트 목록을 조회한다."
    )
    @ApiResponse(
            responseCode = "200",
            description = "이벤트 목록 조회 성공",
            content = @Content(
                    schema = @Schema(implementation = EventResponse.class),
                    examples = @ExampleObject(
                            name = "이벤트 목록 응답 예시",
                            summary = "노출 중인 이벤트 목록 샘플",
                            value = """
                                {
                                  "success": true,
                                  "code": "EVENT_SUCCESS",
                                  "data": [
                                    {
                                      "id": 1,
                                      "eventType": "OFFICIAL",
                                      "title": "2026 시즌 개막 기념 이벤트",
                                      "startAt": "2026-03-26 12:00:00",
                                      "expireAt": "2026-07-04 23:59:00",
                                      "imageUrl": "https://compyafun.com/uploads/images/sample.png",
                                      "externalLink": "https://cafe.naver.com/com2usbaseball2015/1956342",
                                      "visible": true
                                    }
                                  ]
                                }
                                """
                    )
            )
    )
    GlobalResponse<List<EventResponse>> getExternalEventList();
}
