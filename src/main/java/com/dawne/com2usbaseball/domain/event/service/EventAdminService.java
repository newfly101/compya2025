package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.event.dto.request.ChangeEventRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;

public interface EventAdminService {

    // USER
    ListResponse<EventResponse> getExternalEventList();

    // ADMIN CRUD
    OperationResponse<EventMessages> createEvent(ChangeEventRequest request);
    OperationResponse<EventMessages> updateEvent(ChangeEventRequest request, Long id);
    OperationResponse<EventMessages> updateEventVisible(Long id, boolean visible);

}
