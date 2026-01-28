package com.dawne.com2usbaseball.domain.event.dto.request;

import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.enums.EventSource;

import java.time.LocalDateTime;

public record ChangeEventRequest(
        EventSource eventSource,
        String title,
        LocalDateTime startAt,
        LocalDateTime expireAt,
        String imageUrl,
        String externalLink,
        boolean visible
) {
    public EventEntity toEntity() {
        EventEntity e = new EventEntity();
        applyTo(e);
        return e;
    }

    public EventEntity toEntity(Long id) {
        EventEntity e = new EventEntity();
        e.setId(id);
        applyTo(e);
        return e;
    }

    private void applyTo(EventEntity e) {
        e.setEventSource(eventSource);
        e.setTitle(title);
        e.setStartAt(startAt);
        e.setExpireAt(expireAt);
        e.setImageUrl(imageUrl);
        e.setExternalLink(externalLink);
        e.setVisible(visible);
    }
}
