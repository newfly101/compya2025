package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.BoardRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.BoardResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingTarget;

// 요청 DTO 에 없는 엔티티 필드(id·시각·카운터 등)는 서버가 채운다.
// 그래서 요청→엔티티 방향의 unmapped 경고만 끄고, 응답 매핑은 그대로 감시한다.
@Mapper(componentModel = "spring")
public interface BoardMapStruct {

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    BoardEntity toEntity(BoardRequest request);

    BoardResponse toResponse(BoardEntity entity);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateFromRequest(BoardRequest request, @MappingTarget BoardEntity entity);
}
