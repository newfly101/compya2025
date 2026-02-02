package com.dawne.com2usbaseball.domain.community.dto.response.tag;

public record UpdateTagResponse(
        boolean success,
        String message,
        Long tagId
) {
    public static UpdateTagResponse success(Long tagId) {
        return new UpdateTagResponse(
                true,
                "이벤트가 성공적으로 등록되었습니다.",
                tagId
        );
    }

    public static UpdateTagResponse fail() {
        return new UpdateTagResponse(
                false,
                "이벤트 생성에 실패했습니다.",
                null
        );
    }
}
