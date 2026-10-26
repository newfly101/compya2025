package com.dawne.com2usbaseball.domain.chat.service.support;

import com.dawne.com2usbaseball.domain.gamification.entity.LedgerEntity;
import com.dawne.com2usbaseball.domain.gamification.entity.TitleEntity;
import com.dawne.com2usbaseball.domain.gamification.repository.GamificationRepository;
import com.dawne.com2usbaseball.domain.gamification.service.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 채팅 메시지·관리자 접속 목록에 붙일 레벨과 장착 칭호(1개) */
@Component
@RequiredArgsConstructor
public class ChatBadgeReader {

    private final GamificationRepository gamificationRepository;

    public int levelOf(Long userId) {
        LedgerEntity sums = gamificationRepository.findSums(userId);
        return RewardService.levelOf(sums == null ? 0 : sums.getXpDelta(), gamificationRepository.findLevels());
    }

    /** 장착 칭호 이름, 없으면 null */
    public String titleOf(Long userId) {
        return gamificationRepository.findOwnedTitles(userId).stream()
                .filter(TitleEntity::isEquipped).map(TitleEntity::getName).findFirst().orElse(null);
    }
}
