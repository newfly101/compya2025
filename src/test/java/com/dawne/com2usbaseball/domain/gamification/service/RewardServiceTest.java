package com.dawne.com2usbaseball.domain.gamification.service;

import com.dawne.com2usbaseball.domain.gamification.entity.RewardLevelEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RewardServiceTest {

    private static final List<RewardLevelEntity> LEVELS = List.of(
            new RewardLevelEntity(1, "연습생", 0, 0),
            new RewardLevelEntity(2, "신인", 50, 100),
            new RewardLevelEntity(3, "퓨처스", 150, 150));

    @Test
    @DisplayName("누적 XP 로 등급이 정해진다 — 경계값 포함")
    void 등급_계산() {
        assertEquals(1, RewardService.levelOf(0, LEVELS));
        assertEquals(1, RewardService.levelOf(49, LEVELS));
        assertEquals(2, RewardService.levelOf(50, LEVELS));
        assertEquals(3, RewardService.levelOf(9999, LEVELS));
    }
}
