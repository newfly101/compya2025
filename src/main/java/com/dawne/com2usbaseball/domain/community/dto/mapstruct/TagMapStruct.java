package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.TagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.TagResponse;
import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface TagMapStruct {

    TagEntity toEntity(TagRequest request);

    TagResponse toResponse(TagEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromRequest(TagRequest request, @MappingTarget TagEntity entity);
}
