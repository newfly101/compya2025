package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.PostTagRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostTagResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostTagEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

// 요청 DTO 에 없는 엔티티 필드(id·시각·카운터 등)는 서버가 채운다.
// 그래서 요청→엔티티 방향의 unmapped 경고만 끄고, 응답 매핑은 그대로 감시한다.
@Mapper(componentModel = "spring")
public interface PostTagMapStruct {

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    PostTagEntity toEntity(PostTagRequest request);

    PostTagResponse toResponse(PostTagEntity entity);
}
