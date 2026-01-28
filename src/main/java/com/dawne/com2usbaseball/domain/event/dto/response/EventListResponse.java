package com.dawne.com2usbaseball.domain.event.dto.response;

import java.util.List;

public record EventListResponse(
        List<EventResponse> events,
        int totalCount
) {
    public static EventListResponse of(List<EventResponse> events) {
        return new EventListResponse(events, events.size());
    }
}
