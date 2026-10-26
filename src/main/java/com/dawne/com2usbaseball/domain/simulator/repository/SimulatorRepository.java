package com.dawne.com2usbaseball.domain.simulator.repository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Map;

/**
 * Valkey 접근. 키 = {prefix}:sim:gsb:{userId}:{email|noemail}, Hash(필드 legendId, 값 JSON {g,c,s}).
 * 쓸 때마다 TTL 30일 재설정.
 */
@Repository
public class SimulatorRepository {

    private static final Duration TTL = Duration.ofDays(30);

    private final StringRedisTemplate redis;
    private final String keyPrefix;

    public SimulatorRepository(StringRedisTemplate redis, @Value("${chat.key-prefix:dev}") String prefix) {
        this.redis = redis;
        this.keyPrefix = prefix + ":sim:gsb:";
    }

    public String key(long userId, String emailOrNoemail) {
        return keyPrefix + userId + ":" + emailOrNoemail;
    }

    public Map<Object, Object> findAll(String key) {
        return redis.opsForHash().entries(key);
    }

    public void saveAll(String key, Map<String, String> fieldToJson) {
        redis.opsForHash().putAll(key, fieldToJson);
        redis.expire(key, TTL);
    }

    public boolean delete(String key, String legendId) {
        Long removed = redis.opsForHash().delete(key, legendId);
        return removed != null && removed > 0;
    }
}
