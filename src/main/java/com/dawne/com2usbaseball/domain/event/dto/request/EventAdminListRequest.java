package com.dawne.com2usbaseball.domain.event.dto.request;

import com.dawne.com2usbaseball.domain.event.enums.EventType;

public record EventAdminListRequest(
        Integer page,
        Integer size,
        EventType eventType,
        Boolean visible
) {
    public EventAdminListRequest {
        if (page == null) page = 0;
        if (size == null) size = 20;
    }

    public int offset() {
        return page * size;
    }
}
