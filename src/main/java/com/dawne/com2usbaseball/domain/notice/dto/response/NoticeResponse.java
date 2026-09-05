package com.dawne.com2usbaseball.domain.notice.dto.response;

import com.dawne.com2usbaseball.domain.notice.enums.NoticeSource;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record NoticeResponse(
        Long id,
        NoticeSource source,
        String title,
        String summary,
        String content,
        String externalUrl,
        String imageUrl,
        Boolean isVisible,
        Boolean isPinned,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime publishedAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime updatedAt
) {}
