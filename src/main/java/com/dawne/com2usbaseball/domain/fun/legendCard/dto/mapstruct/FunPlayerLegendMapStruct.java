package com.dawne.com2usbaseball.domain.fun.legendCard.dto.mapstruct;

import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendMaterialResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.entity.PlayerLegendEntity;
import com.dawne.com2usbaseball.domain.fun.legendCard.entity.PlayerLegendMaterialEntity;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FunPlayerLegendMapStruct {

    FunPlayerLegendResponse toResponse(PlayerLegendEntity entity);

    List<FunPlayerLegendResponse> toResponseList(List<PlayerLegendEntity> entities);

    FunPlayerLegendMaterialResponse toMaterialResponse(PlayerLegendMaterialEntity entity);

    List<FunPlayerLegendMaterialResponse> toMaterialResponseList(List<PlayerLegendMaterialEntity> entities);
}
