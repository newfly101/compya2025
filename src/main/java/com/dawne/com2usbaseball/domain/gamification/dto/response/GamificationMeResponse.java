package com.dawne.com2usbaseball.domain.gamification.dto.response;

import java.util.List;

public record GamificationMeResponse(
        int xp, int level, String levelName, Integer nextLevelXp, int point,
        List<TitleItem> titles, String equippedCode, List<LedgerItemResponse> recent) {

    public record TitleItem(String code, String name, boolean equipped) {
    }
}
