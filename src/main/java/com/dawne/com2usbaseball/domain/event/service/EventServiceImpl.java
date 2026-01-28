package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.domain.event.dto.response.EventListResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.InsertEventResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.UpdateEventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.repository.EventRepository;
import com.dawne.com2usbaseball.domain.event.service.support.EventListMaker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository repository;
    private final EventListMaker eventListMaker;

    @Override
    @Transactional(readOnly = true)
    public EventListResponse getEventListsByExternal() {
        List<EventEntity> eventEntity = repository.selectCafeEvents();

        return eventListMaker.makeEventListResponse(eventEntity);
    }

    @Override
    public InsertEventResponse createEvent(EventEntity event) {
        boolean success = repository.insertCafeEvent(event);

        if (!success) {
            return InsertEventResponse.fail();
        }

        return InsertEventResponse.success(event.getId());
    }

    @Override
    public UpdateEventResponse updateEvent(EventEntity event) {
        boolean success = repository.updateCafeEvent(event);
        if (!success) {
            return UpdateEventResponse.fail();
        }

        return UpdateEventResponse.success(event.getId());
    }

    @Override
    public UpdateEventResponse updateEventVisible(Long id, boolean visible) {
        boolean success = repository.updateCafeEventVisible(id, visible);
        if (!success) {
            return UpdateEventResponse.fail();
        }

        return UpdateEventResponse.success(id);
    }
}
