package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.domain.event.dto.response.EventListResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.InsertEventResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.UpdateEventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;

public interface EventService {

    // USER
    EventListResponse getEventListsByExternal();

    // ADMIN CRUD
    InsertEventResponse createEvent(EventEntity event);
    UpdateEventResponse updateEvent(EventEntity event);
    UpdateEventResponse updateEventVisible(Long id, boolean visible);

}
