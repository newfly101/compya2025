package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.domain.event.dto.request.EventRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;

import java.util.List;

public interface EventAdminService {

    // USER
    List<EventResponse> getExternalEventList();

    // ADMIN CRUD
    EventResponse createEvent(EventRequest request);
    EventResponse updateEvent(EventRequest request, Long id);
    void updateEventVisible(Long id, boolean visible);

}
