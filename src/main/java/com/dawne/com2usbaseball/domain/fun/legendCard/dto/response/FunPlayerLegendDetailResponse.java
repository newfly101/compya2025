package com.dawne.com2usbaseball.domain.fun.legendCard.dto.response;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.legendCard.entity.PlayerLegendEntity;
import com.dawne.com2usbaseball.domain.fun.legendCard.enums.LegendType;

import java.util.List;

/**
 * 레전드 단건 + 재료 8행.
 * materials 는 slot_no 순으로 선수 6행 → 코치 2행 순서다.
 */
public record FunPlayerLegendDetailResponse(
        String id,
        String legendName,
        LegendType legendType,
        String teamCode,
        PlayerRole playerRole,
        String positionCode,
        List<FunPlayerLegendMaterialResponse> materials
) {
    /**
     * 레전드와 이미 변환된 재료 목록을 합친다.
     * 매퍼는 1:1 변환만 담당하고, 두 소스를 합치는 일은 여기서 한다.
     */
    public static FunPlayerLegendDetailResponse of(PlayerLegendEntity entity,
                                                   List<FunPlayerLegendMaterialResponse> materials) {
        return new FunPlayerLegendDetailResponse(
                entity.getId(),
                entity.getLegendName(),
                entity.getLegendType(),
                entity.getTeamCode(),
                entity.getPlayerRole(),
                entity.getPositionCode(),
                materials
        );
    }
}
