package com.dawne.com2usbaseball.domain.event.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.event.controller.docs.AdminEventSwaggerDocs;
import com.dawne.com2usbaseball.domain.event.dto.request.EventRequest;
import com.dawne.com2usbaseball.domain.event.dto.request.EventVisibleRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import com.dawne.com2usbaseball.domain.event.service.EventAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/events")
public class AdminEventController implements AdminEventSwaggerDocs {

    private final EventAdminService eventAdminService;

    @Override
    @GetMapping("/external")
    public GlobalResponse<List<EventResponse>> getExternalEventList() {
        List<EventResponse> eventList =  eventAdminService.getExternalEventList();
        return GlobalResponse.success(EventMessages.EVENT_SUCCESS, eventList);
    }

    @Override
    @PostMapping
    public GlobalResponse<EventResponse>  insertNewEvent(@RequestBody EventRequest request) {
        EventResponse newEvent = eventAdminService.createEvent(request);

        return GlobalResponse.success(EventMessages.EVENT_CREATED, newEvent);
    }

    @Override
    @PatchMapping("/{id}")
    public GlobalResponse<EventResponse> updateExternalEvent(@RequestBody EventRequest request, @PathVariable Long id) {
        EventResponse updatedEvent = eventAdminService.updateEvent(request, id);

        return GlobalResponse.success(EventMessages.EVENT_UPDATED, updatedEvent);
    }

    @Override
    @PatchMapping("/{id}/visible")
    public GlobalResponse<Void> updateExternalEventVisible(@PathVariable Long id, @RequestBody EventVisibleRequest request) {
        eventAdminService.updateEventVisible(id, request.visible());

        return GlobalResponse.success(EventMessages.EVENT_VISIBLE_UPDATED, null);
    }
}
