package com.dawne.com2usbaseball.domain.event.dto.mapstruct;

import com.dawne.com2usbaseball.domain.event.dto.request.EventRequest;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.entity.EventEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface EventMapStruct {

    // startAt/expireAt은 요청이 String, 엔티티는 LocalDateTime이라 타입이 달라 자동 매핑이 불가능하다.
    // 서비스 레이어에서 날짜 정규화(기본 시각 보정) 후 별도로 채운다.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "startAt", ignore = true)
    @Mapping(target = "expireAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    EventEntity toEntity(EventRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "startAt", ignore = true)
    @Mapping(target = "expireAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(EventRequest request, @MappingTarget EventEntity entity);

    EventResponse toResponse(EventEntity entity);

    List<EventResponse> toResponseList(List<EventEntity> entities);
}
