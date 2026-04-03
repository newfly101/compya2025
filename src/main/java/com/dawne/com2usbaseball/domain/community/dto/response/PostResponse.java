package com.dawne.com2usbaseball.domain.community.dto.response;

import com.dawne.com2usbaseball.domain.community.enums.LinkType;
import com.dawne.com2usbaseball.domain.community.enums.UserRoleType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        Long boardId,
        UserRoleType userRoleType,
        Long authorId,
        String authorName,
        String title,
        String content,
        LinkType linkType,
        String externalUrl,
        Boolean isPinned,
        Boolean isVisible,
        Boolean isDeleted,
        Integer viewCount,
        Integer commentCount,
        Integer likeCount,
        Integer dislikeCount,
        Integer reportCount,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime updatedAt
) { }
