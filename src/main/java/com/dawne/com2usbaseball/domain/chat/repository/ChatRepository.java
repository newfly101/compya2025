package com.dawne.com2usbaseball.domain.chat.repository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Collection;
import java.util.List;

/**
 * Valkey 접근. 키·채널 = {prefix}:chat:lobby, 레이트리밋 = {prefix}:chat:rl:{userId},
 * 게스트 = {prefix}:chat:guest:tok:{token} / :num:{n}, 접속자 Hash = {prefix}:chat:presence
 */
@Repository
public class ChatRepository {

    public static final int MAX_MESSAGES = 100;
    public static final Duration GUEST_TTL = Duration.ofHours(24);
    private static final Duration RATE_LIMIT = Duration.ofMillis(3000);

    private final StringRedisTemplate redis;
    private final String lobbyKey;
    private final String rateLimitPrefix;
    private final String guestTokenPrefix;
    private final String guestNumberPrefix;
    private final String presenceKey;

    public ChatRepository(StringRedisTemplate redis, @Value("${chat.key-prefix:dev}") String prefix) {
        this.redis = redis;
        this.lobbyKey = prefix + ":chat:lobby";
        this.rateLimitPrefix = prefix + ":chat:rl:";
        this.guestTokenPrefix = prefix + ":chat:guest:tok:";
        this.guestNumberPrefix = prefix + ":chat:guest:num:";
        this.presenceKey = prefix + ":chat:presence";
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

    // ---- 게스트 번호 ----

    /** 토큰에 묶인 번호. 없으면 null */
    public Integer findGuestNumber(String token) {
        String v = redis.opsForValue().get(guestTokenPrefix + token);
        if (v == null) {
            return null;
        }
        try {
            return Integer.valueOf(v);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** SET NX EX 24h — 번호가 비어 있으면 token 으로 예약하고 true */
    public boolean reserveGuestNumber(int number, String token) {
        return Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(guestNumberPrefix + number, token, GUEST_TTL));
    }

    public void saveGuestToken(String token, int number) {
        redis.opsForValue().set(guestTokenPrefix + token, String.valueOf(number), GUEST_TTL);
    }

    /** 두 키의 TTL 을 24h 로 갱신 */
    public void renewGuest(String token, int number) {
        redis.expire(guestTokenPrefix + token, GUEST_TTL);
        redis.expire(guestNumberPrefix + number, GUEST_TTL);
    }

    // ---- 접속자 ----

    public void putPresence(String sessionId, String entryJson) {
        redis.opsForHash().put(presenceKey, sessionId, entryJson);
    }

    /** 실제로 지워졌을 때만 true (이벤트가 두 번 와도 방송은 한 번) */
    public boolean removePresence(String sessionId) {
        Long removed = redis.opsForHash().delete(presenceKey, sessionId);
        return removed != null && removed > 0;
    }

    public Collection<String> findAllPresence() {
        List<Object> values = redis.opsForHash().values(presenceKey);
        return values.stream().map(Object::toString).toList();
    }

    public void clearPresence() {
        redis.delete(presenceKey);
    }
}
