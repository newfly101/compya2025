package com.dawne.com2usbaseball.domain.gamification.dto.response;

import com.dawne.com2usbaseball.domain.gamification.entity.RewardLevelEntity;

public record LevelItemResponse(int level, String name, int requiredXp, int bonusPoint) {
    public static LevelItemResponse of(RewardLevelEntity e) {
        return new LevelItemResponse(e.getLevel(), e.getName(), e.getRequiredXp(), e.getLevelupBonusPoint());
    }
}
