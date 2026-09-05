package com.dawne.com2usbaseball.domain.notice.dto.mapstruct;

import com.dawne.com2usbaseball.domain.notice.dto.request.NoticeRequest;
import com.dawne.com2usbaseball.domain.notice.dto.response.NoticeResponse;
import com.dawne.com2usbaseball.domain.notice.entity.NoticeEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NoticeMapStruct {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    NoticeEntity toEntity(NoticeRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "publishedAt", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(NoticeRequest request, @MappingTarget NoticeEntity entity);

    NoticeResponse toResponse(NoticeEntity entity);

    List<NoticeResponse> toResponseList(List<NoticeEntity> entities);
}
