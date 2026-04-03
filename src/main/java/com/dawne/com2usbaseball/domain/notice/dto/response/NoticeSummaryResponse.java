package com.dawne.com2usbaseball.domain.notice.dto.response;

import java.time.LocalDateTime;

public record NoticeSummaryResponse(
        Long id,
        String source,
        String title,
        String summary,
        String externalUrl,
        Boolean isPinned,
        LocalDateTime publishedAt
) {}
