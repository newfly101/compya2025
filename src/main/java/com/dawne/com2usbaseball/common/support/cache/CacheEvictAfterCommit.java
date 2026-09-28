package com.dawne.com2usbaseball.common.support.cache;

import java.lang.annotation.ElementType;
import java.lang.annotation.Repeatable;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 메서드 정상 종료 + 트랜잭션 commit 성공 후에 지정한 캐시 키들을 evict.
 * 트랜잭션 없으면 즉시 evict (fallback).
 *
 * 캐시가 여러 개면 애노테이션을 여러 번 붙인다.
 *
 * 예: {@code @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})}
 * 예: {@code @CacheEvictAfterCommit(cacheName = "noticeDetail", keyExpressions = {"#noticeId + '_admin'"})}
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Repeatable(CacheEvictsAfterCommit.class)
public @interface CacheEvictAfterCommit {
    String cacheName();

    /** 고정 키. 문자열 그대로 키로 쓴다. */
    String[] keys() default {};

    /** 메서드 인자로 조립하는 키. SpEL 로 평가한다 — {@code @CacheEvict(key = ...)} 와 같은 표현식. */
    String[] keyExpressions() default {};

    /** true 면 키를 무시하고 캐시 전체를 비운다. */
    boolean allEntries() default false;
}
