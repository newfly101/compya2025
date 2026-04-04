package com.dawne.com2usbaseball.domain.event.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.event.controller.docs.EventSwaggerDocs;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import com.dawne.com2usbaseball.domain.event.service.EventUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class EventController implements EventSwaggerDocs {

    private final EventUserService eventUserService;

    @Override
    @GetMapping("/external")
    public GlobalResponse<List<EventResponse>> getExternalEventList() {
        List<EventResponse> eventList = eventUserService.getExternalEventList();

        return GlobalResponse.success(EventMessages.EVENT_SUCCESS, eventList);
    }
}
