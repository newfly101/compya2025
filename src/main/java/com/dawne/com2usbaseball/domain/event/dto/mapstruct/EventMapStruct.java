package com.dawne.com2usbaseball.domain.event.dto.mapstruct;

import com.dawne.com2usbaseball.domain.event.dto.request.ChangeEventRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EventMapStruct {

    @Mapping(target = "id", ignore = true)
    EventEntity toEntity(ChangeEventRequest request);

    EventResponse toResponse(EventEntity entity);

    List<EventResponse> toResponseList(List<EventEntity> entities);

    default EventEntity toEntity(ChangeEventRequest request, Long id) {
        EventEntity entity = toEntity(request);
        entity.setId(id);
        return entity;
    }
}
