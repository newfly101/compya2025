package com.dawne.com2usbaseball.domain.community.dto.response;

public record InsertBoardResponse(
        boolean success,
        String message,
        Long boardId
) {
    public static InsertBoardResponse success(Long boardId) {
        return new InsertBoardResponse(
                true,
                "이벤트가 성공적으로 등록되었습니다.",
                boardId
        );
    }

    public static InsertBoardResponse fail() {
        return new InsertBoardResponse(
                false,
                "이벤트 생성에 실패했습니다.",
                null
        );
    }
}
