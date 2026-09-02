package com.dawne.com2usbaseball.domain.fun.legendStat.dto.response;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.legendCard.enums.LegendType;

import java.math.BigDecimal;
import java.util.List;

/**
 * 레전드 1명의 태생 스탯.
 *
 * stats 는 5칸 배열이고 슬롯 의미는 playerRole 이 정한다 (PlayerStatLabel 과 1:1).
 * OVR 은 담지 않는다 — 5스탯 평균이라 화면이 계산한다. 응답에 넣으면 스탯과 어긋난다.
 * 구단 한글명도 담지 않는다 — GET /api/teams 가 그 역할이다.
 */
public record FunLegendStatResponse(
        String id,
        String legendName,
        LegendType legendType,
        String teamCode,
        PlayerRole playerRole,
        List<String> positions,
        BigDecimal rating,
        String ratingRev,
        List<Short> stats,
        List<FunLegendPitchResponse> pitches   // 투수만. 타자는 null
) {
}
