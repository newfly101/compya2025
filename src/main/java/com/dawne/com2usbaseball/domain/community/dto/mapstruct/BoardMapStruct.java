package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.BoardRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.BoardResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BoardMapStruct {

    BoardEntity toEntity(BoardRequest request);

    BoardResponse toResponse(BoardEntity entity);

    void updateFromRequest(BoardRequest request, @MappingTarget BoardEntity entity);
}
