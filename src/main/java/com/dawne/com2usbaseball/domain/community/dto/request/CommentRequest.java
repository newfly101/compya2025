package com.dawne.com2usbaseball.domain.community.dto.request;

import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;

public record CommentRequest (
        Long postId,
        Long parentCommentId,
        UserRoleType userRoleType,
        Long authorId,
        String authorName,
        String content,
        Boolean isVisible
){ }
