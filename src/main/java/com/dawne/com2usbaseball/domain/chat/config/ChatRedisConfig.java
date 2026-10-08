package com.dawne.com2usbaseball.domain.chat.config;

import com.dawne.com2usbaseball.domain.chat.repository.ChatRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.EventListener;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.nio.charset.StandardCharsets;

/** Pub/Sub 수신 → /topic/chats.lobby 로 envelope JSON 그대로 전달 (서버가 여러 대여도 각자 받는다) */
@Slf4j
@Configuration
public class ChatRedisConfig {

    public static final String TOPIC = "/topic/chats.lobby";

    @Bean
    RedisMessageListenerContainer chatListenerContainer(RedisConnectionFactory factory,
                                                        ChatRepository chatRepository,
                                                        SimpMessagingTemplate template) {
        // Valkey 가 없어도 앱(과 다른 기능·컨텍스트 테스트)은 떠야 한다 → 자동 시작 끄고 아래에서 직접 시작
        RedisMessageListenerContainer container = new RedisMessageListenerContainer() {
            @Override
            public boolean isAutoStartup() {
                return false;
            }
        };
        container.setConnectionFactory(factory);
        container.addMessageListener(
                (message, pattern) -> template.convertAndSend(TOPIC, new String(message.getBody(), StandardCharsets.UTF_8)),
                new ChannelTopic(chatRepository.channel()));
        return container;
    }

    // ponytail: 시작 실패 시 재시도 없음 — Valkey 를 먼저 올리고 앱을 재기동. 필요하면 재시도 스케줄러 추가
    @EventListener(ApplicationReadyEvent.class)
    void startListener(ApplicationReadyEvent event) {
        try {
            event.getApplicationContext().getBean(RedisMessageListenerContainer.class).start();
        } catch (Exception e) {
            log.error("chat: Valkey Pub/Sub 구독 시작 실패 — 실시간 전달 비활성", e);
        }
    }
}
