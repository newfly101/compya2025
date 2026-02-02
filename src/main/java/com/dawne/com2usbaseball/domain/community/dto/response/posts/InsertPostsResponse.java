package com.dawne.com2usbaseball.domain.community.dto.response.posts;

public record InsertPostsResponse(
        boolean success,
        String message,
        Long boardId
) {
    public static InsertPostsResponse success(Long postId) {
        return new InsertPostsResponse(
                true,
                "이벤트가 성공적으로 등록되었습니다.",
                postId
        );
    }

    public static InsertPostsResponse fail() {
        return new InsertPostsResponse(
                false,
                "이벤트 생성에 실패했습니다.",
                null
        );
    }
}
