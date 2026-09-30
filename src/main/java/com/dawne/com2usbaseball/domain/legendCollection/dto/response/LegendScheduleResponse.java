package com.dawne.com2usbaseball.domain.legendCollection.dto.response;

import com.dawne.com2usbaseball.domain.legendCollection.entity.ScheduleItemEntity;
import com.dawne.com2usbaseball.domain.legendCollection.enums.LegendStatus;

import java.util.List;

/** 오늘 일차 + 14일 주기 전체의 "내 선호 미보유 재료" 획득 일정. */
public record LegendScheduleResponse(int todayDayNo, List<Item> items) {

    public record Item(
            int dayNo,
            int roundNo,
            String roundLabel,
            String legendId,
            String legendName,
            int rank,
            boolean frame,
            String materialId,
            String playerName,
            int seasonYear
    ) {
    }

    public static LegendScheduleResponse of(int todayDayNo, List<ScheduleItemEntity> rows) {
        return new LegendScheduleResponse(todayDayNo, rows.stream()
                .map(r -> new Item(r.getDayNo(), r.getRoundNo(), r.getRoundLabel(),
                        r.getLegendId(), r.getLegendName(), r.getRankNo(),
                        r.getLegendStatus() == LegendStatus.FRAME,
                        r.getMaterialId(), r.getPlayerName(), r.getSeasonYear()))
                .toList());
    }
}
