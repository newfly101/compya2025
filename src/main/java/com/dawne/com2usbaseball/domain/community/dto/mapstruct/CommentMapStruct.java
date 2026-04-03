package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.CommentRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentResponse;
import com.dawne.com2usbaseball.domain.community.entity.CommentEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface CommentMapStruct {

    CommentEntity toEntity(CommentRequest request);

    CommentResponse toResponse(CommentEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromRequest(CommentRequest request, @MappingTarget CommentEntity entity);
}
