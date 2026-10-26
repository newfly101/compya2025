package com.dawne.com2usbaseball.domain.chat.config;

import com.dawne.com2usbaseball.domain.chat.service.ChatPresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/** STOMP 연결·끊김 → 접속자 기록. Valkey 가 없어도 앱이 떠야 하므로 예외는 로그만 남기고 삼킨다. */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChatPresenceListener {

    private final ChatPresenceService presenceService;

    // ponytail: 서버 여러 대가 같은 prefix 를 쓰면 서버별 키 + TTL 로 바꿔야 한다 (지금은 시작 때 전체를 비움)
    @EventListener(ApplicationReadyEvent.class)
    void clearOnStart() {
        try {
            presenceService.clearAll();
        } catch (Exception e) {
            log.error("chat: 접속자 초기화 실패", e);
        }
    }

    @EventListener
    void onConnected(SessionConnectedEvent event) {
        try {
            String sessionId = StompHeaderAccessor.wrap(event.getMessage()).getSessionId();
            presenceService.connect(sessionId, event.getUser());
        } catch (Exception e) {
            log.error("chat: 접속자 기록 실패", e);
        }
    }

    @EventListener
    void onDisconnect(SessionDisconnectEvent event) {
        try {
            presenceService.disconnect(event.getSessionId());
        } catch (Exception e) {
            log.error("chat: 접속자 삭제 실패", e);
        }
    }
}
