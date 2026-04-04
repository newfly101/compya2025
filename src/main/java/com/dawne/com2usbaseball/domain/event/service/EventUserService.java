package com.dawne.com2usbaseball.domain.event.service;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;

import java.util.List;

public interface EventUserService {
    List<EventResponse> getExternalEventList();
}
