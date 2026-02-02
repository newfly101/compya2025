package com.dawne.com2usbaseball.domain.community.dto.response.posts;

public record UpdatePostsResponse(
        boolean success,
        String message,
        Long boardId
) {
    public static UpdatePostsResponse success(Long postId) {
        return new UpdatePostsResponse(
                true,
                "이벤트가 성공적으로 등록되었습니다.",
                postId
        );
    }

    public static UpdatePostsResponse fail() {
        return new UpdatePostsResponse(
                false,
                "이벤트 생성에 실패했습니다.",
                null
        );
    }
}
