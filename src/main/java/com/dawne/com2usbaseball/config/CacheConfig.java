//package com.dawne.com2usbaseball.config;
//
//import com.github.benmanes.caffeine.cache.Caffeine;
//import org.springframework.cache.CacheManager;
//import org.springframework.cache.caffeine.CaffeineCache;
//import org.springframework.cache.support.SimpleCacheManager;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//import java.util.List;
//import java.util.concurrent.TimeUnit;
//
///**
// * 인메모리 캐시 설정
// *
// * <pre>
// * - 캐시 구현체: Caffeine (TTL + maximumSize 지원)
// * - TTL 만료 방식: expireAfterWrite (마지막 쓰기 후 N분)
// * - @EnableCaching 은 Com2usbaseballApplication 에서 선언됨
// * </pre>
// *
// * <b>캐시명 규칙</b>
// * <ul>
// *   <li>user*   — 사용자 노출 데이터 (변동 빈도 기준 TTL)</li>
// *   <li>admin*  — 관리자 전용 (write 시 evict)</li>
// *   <li>그 외    — 도메인 단위 공유 캐시</li>
// * </ul>
// */
//@Configuration
//public class CacheConfig {
//
//    @Bean
//    public CacheManager cacheManager() {
//        SimpleCacheManager manager = new SimpleCacheManager();
//        manager.setCaches(List.of(
//
//                /* ── KBO ────────────────────────────────── */
//                // 경기 중 실시간 데이터 변경 → 짧은 TTL
//                cache("kboMatches",              5),
//
//                /* ── 이벤트 / 쿠폰 ────────────────────── */
//                cache("events",                 30),
//                cache("coupons",                30),
//
//                /* ── 커뮤니티 ──────────────────────────── */
//                cache("userBoards",             10),
//                cache("userPosts",               5),
//                cache("adminBoards",            10),
//                cache("adminPosts",              5),
//                cache("adminTags",              30),
//
//                /* ── 퀴즈 ──────────────────────────────── */
//                cache("quizAnswers",            10),
//
//                /* ── 선수 / 스킬 (정적 데이터) ──────────── */
//                cache("playerInfoByTarget",     60),
//                cache("playerSkillSetByTarget", 60),
//                cache("coachSkills",            60),
//                cache("skillScoreConfig",       60)
//        ));
//        return manager;
//    }
//
//    /**
//     * @param name       캐시 이름 (@Cacheable value 와 일치해야 함)
//     * @param ttlMinutes 만료 시간 (분)
//     */
//    private CaffeineCache cache(String name, long ttlMinutes) {
//        return new CaffeineCache(name,
//                Caffeine.newBuilder()
//                        .expireAfterWrite(ttlMinutes, TimeUnit.MINUTES)
//                        .maximumSize(500)
//                        .recordStats()
//                        .build());
//    }
//}
