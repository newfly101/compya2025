package com.dawne.com2usbaseball.domain.event.dto.response;

import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.enums.EventSource;

import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        EventSource eventSource,
        String title,
        LocalDateTime startAt,
        LocalDateTime expireAt,
        String imageUrl,
        String externalLink,
        boolean visible
) {
    public static EventResponse from(EventEntity e) {
        return new EventResponse(
                e.getId(),
                e.getEventSource(),
                e.getTitle(),
                e.getStartAt(),
                e.getExpireAt(),
                e.getImageUrl(),
                e.getExternalLink(),
                e.isVisible()
        );
    }
}
