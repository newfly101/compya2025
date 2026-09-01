package com.dawne.com2usbaseball.domain.fun.legendCard.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.fun.legendCard.dto.mapstruct.FunPlayerLegendMapStruct;
import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendDetailResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendMaterialResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.entity.PlayerLegendEntity;
import com.dawne.com2usbaseball.domain.fun.legendCard.entity.PlayerLegendMaterialEntity;
import com.dawne.com2usbaseball.domain.fun.legendCard.enums.FunPlayerLegendMessages;
import com.dawne.com2usbaseball.domain.fun.legendCard.repository.FunPlayerLegendRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FunPlayerLegendServiceImpl implements FunPlayerLegendService {

    private final FunPlayerLegendRepository funPlayerLegendRepository;
    private final FunPlayerLegendMapStruct mapper;

    @Override
    public List<FunPlayerLegendResponse> getAll(String teamCode, String legendType, String playerRole) {
        List<PlayerLegendEntity> entities =
                funPlayerLegendRepository.findAll(teamCode, legendType, playerRole);

        return mapper.toResponseList(entities);
    }

    @Override
    public FunPlayerLegendDetailResponse getById(String id) {
        PlayerLegendEntity entity = funPlayerLegendRepository.findById(id)
                .orElseThrow(() -> new BaseException(FunPlayerLegendMessages.FUN_PLAYER_LEGEND_NOT_FOUND, HttpStatus.NOT_FOUND));

        List<FunPlayerLegendMaterialResponse> materials =
                mapper.toMaterialResponseList(funPlayerLegendRepository.findMaterialsByLegendId(id));

        return FunPlayerLegendDetailResponse.of(entity, materials);
    }

    @Override
    public List<FunPlayerLegendMaterialResponse> getMaterials(String legendId) {
        // 레전드가 없는데 빈 배열을 주면 오탐을 부른다. 존재 확인을 먼저 한다.
        funPlayerLegendRepository.findById(legendId)
                .orElseThrow(() -> new BaseException(FunPlayerLegendMessages.FUN_PLAYER_LEGEND_NOT_FOUND, HttpStatus.NOT_FOUND));

        return mapper.toMaterialResponseList(funPlayerLegendRepository.findMaterialsByLegendId(legendId));
    }

    @Override
    public List<FunPlayerLegendDetailResponse> getAllWithMaterials(String teamCode, String legendType, String playerRole) {
        List<PlayerLegendEntity> legends =
                funPlayerLegendRepository.findAll(teamCode, legendType, playerRole);
        if (legends.isEmpty()) return List.of();

        // 재료를 legendId 단위로 한 번에 읽어 N+1 을 피한다.
        List<String> legendIds = legends.stream().map(PlayerLegendEntity::getId).toList();
        Map<String, List<PlayerLegendMaterialEntity>> grouped =
                funPlayerLegendRepository.findMaterialsByLegendIds(legendIds).stream()
                        .collect(Collectors.groupingBy(PlayerLegendMaterialEntity::getLegendId));

        return legends.stream()
                .map(legend -> FunPlayerLegendDetailResponse.of(
                        legend,
                        mapper.toMaterialResponseList(grouped.getOrDefault(legend.getId(), List.of()))))
                .toList();
    }
}
