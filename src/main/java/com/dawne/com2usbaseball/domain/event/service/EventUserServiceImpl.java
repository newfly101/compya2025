package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
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

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value="events", key="'external::public'")
    public ListResponse<EventResponse> getExternalEventList() {
        List<EventEntity> events = repository.selectCafeEventUser();

        return ListAssembler.assemble(events, EventResponse::from);
    }
}
