package com.dawne.com2usbaseball.domain.kbo.dto.response;

import java.util.List;

public record KboTeamInfo(
        String code,
        String name,
        String emblemUrl,
        String startingPitcher,
        List<String> recentResults,
        Double aiWinRate          // AI 예측 승률 — 향후 ML 모델 연동 시 채움
) {
}
