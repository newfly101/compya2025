package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.domain.event.dto.mapstruct.EventMapStruct;
import com.dawne.com2usbaseball.domain.event.dto.request.EventRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import com.dawne.com2usbaseball.domain.event.exception.EventException;
import com.dawne.com2usbaseball.domain.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EventAdminServiceImpl implements EventAdminService {

    private final EventRepository repository;
    private final EventMapStruct eventMapStruct;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "events", key = "'external::admin'")
    public List<EventResponse> getExternalEventList() {
        List<EventEntity> events = repository.findExternalEvents();

        return eventMapStruct.toResponseList(events);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'"),
            @CacheEvict(value = "events", key = "'external::public'")
    })
    public EventResponse createEvent(EventRequest request) {
        EventEntity event = eventMapStruct.toEntity(request);

        if (!repository.saveEvent(event)) {
            throw new EventException(EventMessages.EVENT_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        EventEntity saved = repository.findById(event.getId())
                .orElseThrow(() -> new EventException(EventMessages.EVENT_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));

        return eventMapStruct.toResponse(saved);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'"),
            @CacheEvict(value = "events", key = "'external::public'")
    })
    public EventResponse updateEvent(EventRequest request, Long id) {
        EventEntity event = repository.findById(id)
                .orElseThrow(() -> new EventException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));

        eventMapStruct.updateEntity(request, event);

        if(!repository.updateEvent(event)) {
            throw new EventException(EventMessages.EVENT_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return eventMapStruct.toResponse(event);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'"),
            @CacheEvict(value = "events", key = "'external::public'")
    })
    public void updateEventVisible(Long id, boolean visible) {
        repository.findById(id)
                .orElseThrow(() -> new EventException(EventMessages.EVENT_NOT_FOUND, HttpStatus.NOT_FOUND));

        repository.updateEventVisible(id, visible);
    }
}
