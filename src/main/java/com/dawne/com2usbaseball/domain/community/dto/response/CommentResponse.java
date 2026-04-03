package com.dawne.com2usbaseball.domain.community.dto.response;

import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long postId,
        Long parentCommentId,
        UserRoleType userRoleType,
        Long authorId,
        String authorName,
        String content,
        Boolean isVisible,
        Integer likeCount,
        Integer dislikeCount,
        Integer reportCount,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime updatedAt
) {
}
