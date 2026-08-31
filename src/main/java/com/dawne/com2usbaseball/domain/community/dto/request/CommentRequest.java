package com.dawne.com2usbaseball.domain.community.dto.request;

public record CommentRequest (
        Long postId,
        Long parentCommentId,
        String authorName,
        String content,
        Boolean isVisible
){ }
