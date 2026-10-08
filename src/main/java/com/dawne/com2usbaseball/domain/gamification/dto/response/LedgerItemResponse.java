package com.dawne.com2usbaseball.domain.gamification.dto.response;

import com.dawne.com2usbaseball.domain.gamification.entity.LedgerEntity;

public record LedgerItemResponse(String sourceType, int xpDelta, int pointDelta, String reason, String rewardDate) {
    public static LedgerItemResponse of(LedgerEntity e) {
        return new LedgerItemResponse(e.getSourceType(), e.getXpDelta(), e.getPointDelta(), e.getReason(),
                e.getRewardDate().toString());
    }
}
