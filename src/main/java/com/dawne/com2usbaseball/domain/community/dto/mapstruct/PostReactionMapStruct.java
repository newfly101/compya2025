package com.dawne.com2usbaseball.domain.community.dto.mapstruct;

import com.dawne.com2usbaseball.domain.community.dto.request.PostReactionRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.PostReactionResponse;
import com.dawne.com2usbaseball.domain.community.entity.PostReactionEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

// 요청 DTO 에 없는 엔티티 필드(id·시각·카운터 등)는 서버가 채운다.
// 그래서 요청→엔티티 방향의 unmapped 경고만 끄고, 응답 매핑은 그대로 감시한다.
@Mapper(componentModel = "spring")
public interface PostReactionMapStruct {

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    PostReactionEntity toEntity(PostReactionRequest request);

    PostReactionResponse toResponse(PostReactionEntity entity);
}
