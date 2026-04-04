package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.domain.event.dto.mapstruct.EventMapStruct;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import com.dawne.com2usbaseball.domain.event.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EventUserServiceImpl implements EventUserService {

    private final EventRepository repository;
    private final EventMapStruct eventMapStruct;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value="events", key="'external::public'")
    public List<EventResponse> getExternalEventList() {
        List<EventEntity> events = repository.findExternalEventsForUser();

        return eventMapStruct.toResponseList(events);
    }
}
