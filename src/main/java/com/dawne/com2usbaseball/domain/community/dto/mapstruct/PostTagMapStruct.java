package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.PostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostTagResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostTagEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostTagMapStruct {

    PostTagEntity toEntity(PostTagRequest request);

    PostTagResponse toResponse(PostTagEntity entity);
}
