package com.dawne.com2usbaseball.domain.notice.dto.response;

import java.time.LocalDateTime;

public record NoticeDetailResponse(
        Long id,
        String source,
        String title,
        String summary,
        String content,
        String externalUrl,
        Boolean isPinned,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
