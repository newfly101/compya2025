package com.dawne.com2usbaseball.domain.event.service.support;

import com.dawne.com2usbaseball.domain.event.dto.response.EventListResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EventListMaker {

    public EventListResponse makeEventListResponse(List<EventEntity> eventList) {
        List<EventResponse> events = eventList.stream()
                .map(EventResponse::from)
                .toList();

        return EventListResponse.of(events);
    }
}
