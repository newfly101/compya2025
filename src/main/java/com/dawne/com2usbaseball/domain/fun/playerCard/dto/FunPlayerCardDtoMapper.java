package com.dawne.com2usbaseball.domain.fun.playerCard.dto;

import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardCreateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardUpdateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.FunPlayerCardResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.entity.PlayerCardEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface FunPlayerCardDtoMapper {

    // CREATE
    PlayerCardEntity toEntity(FunPlayerCardCreateRequest request);

    // RESPONSE
    FunPlayerCardResponse toResponse(PlayerCardEntity entity);

    // UPDATE (핵심)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateFromRequest(FunPlayerCardUpdateRequest request,
                           @MappingTarget PlayerCardEntity entity);
}
