package com.dawne.com2usbaseball.domain.gamification.service;

import com.dawne.com2usbaseball.domain.gamification.entity.LedgerEntity;
import com.dawne.com2usbaseball.domain.gamification.entity.RewardLevelEntity;
import com.dawne.com2usbaseball.domain.gamification.repository.GamificationRepository;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.gamification.enums.GamificationMessages;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/** 원장에 한 줄 적립하는 유일한 입구. 같은 reward_key 는 무시되고, 새로 들어갔을 때만 등급을 다시 계산한다. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RewardService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    // ponytail: 시범 운영 — test = prod DB 라 관리자(id 1)만 적립. 전체 공개 시 이 상수와 grant 첫 줄 가드를 지운다
    private static final Long PILOT_USER_ID = 1L;

    private final GamificationRepository repository;

    /** 시범 운영 대상이 아니면 400 — grant 가 조용히 무시하기 전에 호출자가 먼저 막는다. 공용 가드는 여기 한 곳. */
    public static void requirePilot(Long userId) {
        if (!PILOT_USER_ID.equals(userId)) {
            throw new BaseException(GamificationMessages.GAMIFICATION_PILOT_ONLY, HttpStatus.BAD_REQUEST);
        }
    }

    public static LocalDate today() {
        return LocalDate.now(KST);
    }

    /** @return 새로 적립됐으면 true, 이미 받은 보상이면 false */
    @Transactional
    public boolean grant(Long userId, String key, String source, int xp, int point, String refCode, String reason) {
        if (!PILOT_USER_ID.equals(userId)) {
            return false;
        }
        boolean inserted = repository.insertLedgerIfAbsent(LedgerEntity.builder()
                .userId(userId).rewardKey(key).sourceType(source)
                .xpDelta(xp).pointDelta(point).rewardDate(today())
                .refCode(refCode).reason(reason).build());
        if (!inserted || xp <= 0) {
            return inserted;
        }
        // 오른 등급마다 보너스 한 줄 (LEVELUP 키로 중복 방지). 보너스 행은 xp 0 이라 재귀하지 않는다.
        int total = repository.findSums(userId).getXpDelta();
        List<RewardLevelEntity> levels = repository.findLevels();
        int before = levelOf(total - xp, levels);
        int after = levelOf(total, levels);
        for (RewardLevelEntity lv : levels) {
            if (lv.getLevel() > before && lv.getLevel() <= after && lv.getLevelupBonusPoint() > 0) {
                grant(userId, "LEVELUP:" + userId + ":" + lv.getLevel(), "LEVELUP", 0,
                        lv.getLevelupBonusPoint(), String.valueOf(lv.getLevel()), lv.getName() + " 승급 보너스");
            }
        }
        return true;
    }

    public static int levelOf(int xp, List<RewardLevelEntity> levels) {
        int result = 1;
        for (RewardLevelEntity lv : levels) {
            if (xp >= lv.getRequiredXp()) {
                result = lv.getLevel();
            }
        }
        return result;
    }
}
