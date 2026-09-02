package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.CommentRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.CommentResponse;
import com.dawne.com2usbaseball.domain.community.entity.CommentEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

// 요청 DTO 에 없는 엔티티 필드(id·시각·카운터 등)는 서버가 채운다.
// 그래서 요청→엔티티 방향의 unmapped 경고만 끄고, 응답 매핑은 그대로 감시한다.
@Mapper(componentModel = "spring")
public interface CommentMapStruct {

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    CommentEntity toEntity(CommentRequest request);

    CommentResponse toResponse(CommentEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
                 unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateFromRequest(CommentRequest request, @MappingTarget CommentEntity entity);
}
