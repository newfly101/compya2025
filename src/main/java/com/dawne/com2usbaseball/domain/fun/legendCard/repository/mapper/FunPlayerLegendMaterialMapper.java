package com.dawne.com2usbaseball.domain.fun.legendCard.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.legendCard.entity.PlayerLegendMaterialEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FunPlayerLegendMaterialMapper {

    List<PlayerLegendMaterialEntity> findByLegendId(@Param("legendId") String legendId);

    /** 여러 레전드의 재료를 한 번에 — 목록 조회에서 N+1 을 피할 때 쓴다. */
    List<PlayerLegendMaterialEntity> findByLegendIds(@Param("legendIds") List<String> legendIds);
}
