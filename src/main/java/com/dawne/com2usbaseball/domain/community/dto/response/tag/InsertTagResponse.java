package com.dawne.com2usbaseball.domain.community.dto.response.tag;

public record InsertTagResponse(
        boolean success,
        String message,
        Long tagId
) {
    public static InsertTagResponse success(Long tagId) {
        return new InsertTagResponse(
                true,
                "이벤트가 성공적으로 등록되었습니다.",
                tagId
        );
    }

    public static InsertTagResponse fail() {
        return new InsertTagResponse(
                false,
                "이벤트 생성에 실패했습니다.",
                null
        );
    }
}
