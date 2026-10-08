package com.dawne.com2usbaseball.domain.chat.repository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.List;

/** Valkey 접근. 키·채널 = {prefix}:chat:lobby, 레이트리밋 = {prefix}:chat:rl:{userId} */
@Repository
public class ChatRepository {

    public static final int MAX_MESSAGES = 100;
    private static final Duration RATE_LIMIT = Duration.ofMillis(3000);

    private final StringRedisTemplate redis;
    private final String lobbyKey;
    private final String rateLimitPrefix;

    public ChatRepository(StringRedisTemplate redis, @Value("${chat.key-prefix:dev}") String prefix) {
        this.redis = redis;
        this.lobbyKey = prefix + ":chat:lobby";
        this.rateLimitPrefix = prefix + ":chat:rl:";
    }

    public String channel() {
        return lobbyKey;
    }

    /** SET NX PX 3000 — 처음이면 true, 3초 안에 또 오면 false */
    public boolean acquireRateLimit(long userId) {
        return Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(rateLimitPrefix + userId, "1", RATE_LIMIT));
    }

    public void push(String messageJson) {
        redis.opsForList().rightPush(lobbyKey, messageJson);
        redis.opsForList().trim(lobbyKey, -MAX_MESSAGES, -1);
    }

    public List<String> findAll() {
        List<String> list = redis.opsForList().range(lobbyKey, 0, -1);
        return list == null ? List.of() : list;
    }

    public boolean remove(String messageJson) {
        Long removed = redis.opsForList().remove(lobbyKey, 1, messageJson);
        return removed != null && removed > 0;
    }

    public void publish(String envelopeJson) {
        redis.convertAndSend(lobbyKey, envelopeJson);
    }
}
