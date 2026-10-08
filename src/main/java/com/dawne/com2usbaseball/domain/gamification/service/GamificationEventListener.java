package com.dawne.com2usbaseball.domain.gamification.service;

import com.dawne.com2usbaseball.common.support.event.ActivitySavedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** 저장이 커밋된 뒤에만 XP 를 준다. 보상 실패가 저장 응답을 깨지 않도록 로그만 남긴다. */
@Slf4j
@Component
@RequiredArgsConstructor
public class GamificationEventListener {

    private final GamificationService gamificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSaved(ActivitySavedEvent event) {
        try {
            gamificationService.onSaved(event.userId()); // 새 트랜잭션 — 서비스의 @Transactional 이 연다
        } catch (RuntimeException e) {
            log.error("저장 XP 지급 실패 userId={}", event.userId(), e);
        }
    }
}
