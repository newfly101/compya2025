package com.dawne.com2usbaseball.domain.notice.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record NoticeDetailResponse(
        Long id,
        String source,
        String title,
        String summary,
        String content,
        String externalUrl,
        Boolean isPinned,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime publishedAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime updatedAt
) {}
