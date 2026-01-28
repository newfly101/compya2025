package com.dawne.com2usbaseball.domain.event.controller;

import com.dawne.com2usbaseball.domain.event.dto.request.ChangeEventRequest;
import com.dawne.com2usbaseball.domain.event.dto.request.ChangeEventVisibleRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventListResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.InsertEventResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.UpdateEventResponse;
import com.dawne.com2usbaseball.domain.event.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class EventController {

    private final EventService service;

    @GetMapping("/list/external")
    public EventListResponse getExternalEventList() {
        return service.getEventListsByExternal();
    }

    @PostMapping("/")
    public InsertEventResponse insertNewEvent(@RequestBody ChangeEventRequest request) {
        return service.createEvent(request.toEntity());
    }

    @PostMapping("/{id}")
    public UpdateEventResponse updateExternalEvent(@RequestBody ChangeEventRequest request, @PathVariable Long id) {
        return service.updateEvent(request.toEntity(id));
    }

    @PostMapping("/{id}/visible")
    public UpdateEventResponse updateExternalEventVisible(@PathVariable Long id, @RequestBody ChangeEventVisibleRequest request) {
        return service.updateEventVisible(id, request.visible());
    }
}
