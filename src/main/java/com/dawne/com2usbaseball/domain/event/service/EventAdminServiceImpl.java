package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import com.dawne.com2usbaseball.domain.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EventAdminServiceImpl implements EventAdminService {

    private final EventRepository repository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value="events", key="'external::admin'")
    public ListResponse<EventResponse> getExternalEventList() {
        List<EventEntity> events = repository.selectCafeEvents();

        return ListAssembler.assemble(events, EventResponse::from);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'", condition="#result.success == true"),
            @CacheEvict(value = "events", key = "'external::public'", condition="#result.success == true")
    })
    public OperationResponse<EventMessages> createEvent(EventEntity event) {
        return repository.insertCafeEvent(event)
                ? OperationResponse.success(EventMessages.EVENT_CREATED, event.getId())
                : OperationResponse.fail(EventMessages.EVENT_FAILED);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'", condition="#result.success == true"),
            @CacheEvict(value = "events", key = "'external::public'", condition="#result.success == true")
    })
    public OperationResponse<EventMessages> updateEvent(EventEntity event) {
        return repository.updateCafeEvent(event)
                ? OperationResponse.success(EventMessages.EVENT_UPDATED, event.getId())
                : OperationResponse.fail(EventMessages.EVENT_FAILED);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "events", key = "'external::admin'", condition="#result.success == true"),
            @CacheEvict(value = "events", key = "'external::public'", condition="#result.success == true")
    })
    public OperationResponse<EventMessages> updateEventVisible(Long id, boolean visible) {
        return repository.updateCafeEventVisible(id, visible)
                ? OperationResponse.success(EventMessages.EVENT_VISIBLE_UPDATED, id)
                : OperationResponse.fail(EventMessages.EVENT_FAILED);
    }
}
