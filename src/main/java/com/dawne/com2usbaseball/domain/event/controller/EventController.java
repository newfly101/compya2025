package com.dawne.com2usbaseball.domain.event.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.event.controller.docs.EventSwaggerDocs;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.service.EventUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class EventController implements EventSwaggerDocs {

    private final EventUserService eventUserService;

    @Override
    @GetMapping("/external")
    public ListResponse<EventResponse> getExternalEventList() {
        return eventUserService.getExternalEventList();
    }
}
