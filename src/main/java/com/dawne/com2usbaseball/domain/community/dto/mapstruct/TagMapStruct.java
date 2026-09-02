package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.TagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.TagResponse;
import com.dawne.com2usbaseball.domain.community.entity.TagEntity;
import org.mapstruct.*;

// 요청 DTO 에 없는 엔티티 필드(id·시각·카운터 등)는 서버가 채운다.
// 그래서 요청→엔티티 방향의 unmapped 경고만 끄고, 응답 매핑은 그대로 감시한다.
@Mapper(componentModel = "spring")
public interface TagMapStruct {

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    TagEntity toEntity(TagRequest request);

    TagResponse toResponse(TagEntity entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
                 unmappedTargetPolicy = ReportingPolicy.IGNORE)
    void updateFromRequest(TagRequest request, @MappingTarget TagEntity entity);
}
