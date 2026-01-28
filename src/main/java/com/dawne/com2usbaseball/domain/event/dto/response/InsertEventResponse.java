package com.dawne.com2usbaseball.domain.event.dto.response;

public record InsertEventResponse(
        boolean success,
        String message,
        Long eventId
) {
    public static InsertEventResponse success(Long eventId) {
        return new InsertEventResponse(
                true,
                "이벤트가 성공적으로 등록되었습니다.",
                eventId
        );
    }

    public static InsertEventResponse fail() {
        return new InsertEventResponse(
                false,
                "이벤트 생성에 실패했습니다.",
                null
        );
    }
}
