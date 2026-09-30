package com.dawne.com2usbaseball.domain.event.dto.response;

import com.dawne.com2usbaseball.domain.event.enums.EventType;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        EventType eventType,
        String title,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime startAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        LocalDateTime expireAt,
        String imageUrl,
        String externalLink,
        boolean visible,
        Long sourceArticleId,
        String contentHtml,
        boolean sourceChanged,
        boolean deadlineUnconfirmed,
        boolean hasContent
) {
    /** 목록용 — 본문은 비우고 hasContent 로만 알린다(페이로드 경감). */
    public EventResponse withoutContent() {
        return new EventResponse(id, eventType, title, startAt, expireAt, imageUrl, externalLink, visible,
                sourceArticleId, null, sourceChanged, deadlineUnconfirmed, hasContent);
    }
}
