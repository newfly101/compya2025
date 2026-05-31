package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.domain.event.dto.request.EventRequest;
import com.dawne.com2usbaseball.domain.event.dto.request.EventAdminListRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;

import java.util.List;

public interface EventAdminService {

    // USER
    List<EventResponse> getExternalEventList();

    // ADMIN CRUD
    List<EventResponse> getAdminEventList(EventAdminListRequest request);
    EventResponse createEvent(EventRequest request);
    EventResponse updateEvent(EventRequest request, Long id);
    void updateEventVisible(Long id, boolean visible);
    void deleteEvent(Long id);

}
