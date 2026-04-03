package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.PostReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostReactionResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostReactionEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostReactionMapStruct {

    PostReactionEntity toEntity(PostReactionRequest request);

    PostReactionResponse toResponse(PostReactionEntity entity);
}
