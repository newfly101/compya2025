package com.dawne.com2usbaseball.domain.event.dto.response;

public record UpdateEventResponse(
        boolean success,
        String message,
        Long eventId
) {
    public static UpdateEventResponse success(Long eventId) {
        return new UpdateEventResponse(
                true,
                "이벤트가 성공적으로 수정 되었습니다.",
                eventId
        );
    }

    public static UpdateEventResponse fail() {
        return new UpdateEventResponse(
                false,
                "이벤트 생성에 실패했습니다.",
                null
        );
    }
}
