package com.dawne.com2usbaseball.domain.notice.dto.request;

import com.dawne.com2usbaseball.domain.notice.enums.NoticeSource;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;


public record NoticeRequest(
        NoticeSource source,
        String title,
        String summary,
        String content,
        String externalUrl,
        String imageUrl,
        Boolean isVisible,
        Boolean isPinned,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime publishedAt
) {}
