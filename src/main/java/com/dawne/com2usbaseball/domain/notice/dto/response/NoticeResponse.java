package com.dawne.com2usbaseball.domain.notice.dto.response;

import java.time.LocalDateTime;

public record NoticeResponse(
        Long id,
        String source,
        String title,
        String summary,
        String content,
        String externalUrl,
        Boolean isVisible,
        Boolean isPinned,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
