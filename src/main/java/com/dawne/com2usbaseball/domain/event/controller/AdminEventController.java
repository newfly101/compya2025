package com.dawne.com2usbaseball.domain.event.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.event.dto.request.ChangeEventRequest;
import com.dawne.com2usbaseball.domain.event.dto.request.ChangeEventVisibleRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import com.dawne.com2usbaseball.domain.event.service.EventAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/events")
public class AdminEventController {

    private final EventAdminService eventAdminService;

    @GetMapping("/external")
    public ListResponse<EventResponse> getExternalEventList() {
        return eventAdminService.getExternalEventList();
    }

    @PostMapping
    public OperationResponse<EventMessages> insertNewEvent(@RequestBody ChangeEventRequest request) {
        return eventAdminService.createEvent(request.toEntity());
    }

    @PatchMapping("/{id}")
    public OperationResponse<EventMessages> updateExternalEvent(@RequestBody ChangeEventRequest request, @PathVariable Long id) {
        return eventAdminService.updateEvent(request.toEntity(id));
    }

    @PatchMapping("/{id}/visible")
    public OperationResponse<EventMessages> updateExternalEventVisible(@PathVariable Long id, @RequestBody ChangeEventVisibleRequest request) {
        return eventAdminService.updateEventVisible(id, request.visible());
    }
}
