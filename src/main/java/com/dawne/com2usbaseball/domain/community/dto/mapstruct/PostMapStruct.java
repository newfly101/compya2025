package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.PostRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PostMapStruct {

    PostEntity toEntity(PostRequest request);

    PostResponse toResponse(PostEntity entity);

    void updateFromRequest(PostRequest request, @MappingTarget PostEntity entity);
}
