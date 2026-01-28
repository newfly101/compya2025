package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.domain.event.entity.EventEntity;

import java.util.List;

public interface EventService {

    // USER
    List<EventEntity> getEventListsByExternal();

    // ADMIN CRUD
    EventEntity createEvent(EventEntity event);
    void updateEvent(EventEntity event);
    void updateEventVisible(Long id, boolean visible);

}
