package com.dawne.com2usbaseball.domain.fun.legendCard.repository;

import com.dawne.com2usbaseball.domain.fun.legendCard.entity.PlayerLegendEntity;
import com.dawne.com2usbaseball.domain.fun.legendCard.entity.PlayerLegendMaterialEntity;
import com.dawne.com2usbaseball.domain.fun.legendCard.repository.mapper.FunPlayerLegendMapper;
import com.dawne.com2usbaseball.domain.fun.legendCard.repository.mapper.FunPlayerLegendMaterialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class FunPlayerLegendRepository {

    private final FunPlayerLegendMapper playerLegendMapper;
    private final FunPlayerLegendMaterialMapper playerLegendMaterialMapper;

    public Optional<PlayerLegendEntity> findById(String id) {
        return playerLegendMapper.findById(id);
    }

    public List<PlayerLegendEntity> findAll(String teamCode, String legendType, String playerRole) {
        return playerLegendMapper.findAll(teamCode, legendType, playerRole);
    }

    public List<PlayerLegendMaterialEntity> findMaterialsByLegendId(String legendId) {
        return playerLegendMaterialMapper.findByLegendId(legendId);
    }

    public List<PlayerLegendMaterialEntity> findMaterialsByLegendIds(List<String> legendIds) {
        if (legendIds == null || legendIds.isEmpty()) return List.of();
        return playerLegendMaterialMapper.findByLegendIds(legendIds);
    }
}
