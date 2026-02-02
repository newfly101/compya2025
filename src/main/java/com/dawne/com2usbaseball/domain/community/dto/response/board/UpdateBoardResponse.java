package com.dawne.com2usbaseball.domain.community.dto.response.board;

public record UpdateBoardResponse(
        boolean success,
        String message,
        Long boardId
) {
    public static UpdateBoardResponse success(Long boardId) {
        return new UpdateBoardResponse(
                true,
                "이벤트가 성공적으로 등록되었습니다.",
                boardId
        );
    }

    public static UpdateBoardResponse fail() {
        return new UpdateBoardResponse(
                false,
                "이벤트 생성에 실패했습니다.",
                null
        );
    }
}
