package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.CommentReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentReactionResponse;
import com.dawne.com2usbaseball.domain.community.entity.CommentReactionEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CommentReactionMapStruct {

    CommentReactionEntity toEntity(CommentReactionRequest request);

    CommentReactionResponse toResponse(CommentReactionEntity entity);
}
