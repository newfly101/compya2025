package com.dawne.com2usbaseball.domain.fun.legendCard.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.legendCard.entity.PlayerLegendEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface FunPlayerLegendMapper {

    Optional<PlayerLegendEntity> findById(@Param("id") String id);

    /** 조건은 전부 선택이다. null 이면 해당 조건을 걸지 않는다. */
    List<PlayerLegendEntity> findAll(@Param("teamCode") String teamCode,
                                     @Param("legendType") String legendType,
                                     @Param("playerRole") String playerRole);
}
