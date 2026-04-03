package com.dawne.com2usbaseball.domain.notice.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record ChangeNoticeRequest(
        String source,
        String title,
        String summary,
        String content,
        String externalUrl,
        Boolean isVisible,
        Boolean isPinned,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime publishedAt
) {}
