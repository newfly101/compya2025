package com.dawne.com2usbaseball.domain.notice.dto.response;

import com.dawne.com2usbaseball.domain.notice.enums.NoticeSource;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record NoticeSummaryResponse(
        Long id,
        NoticeSource source,
        String title,
        String summary,
        String imageUrl,
        String externalUrl,
        Boolean isPinned,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime publishedAt
) {}
