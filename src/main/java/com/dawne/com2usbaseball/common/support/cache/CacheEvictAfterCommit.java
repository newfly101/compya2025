package com.dawne.com2usbaseball.common.support.cache;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 메서드 정상 종료 + 트랜잭션 commit 성공 후에 지정한 캐시 키들을 evict.
 * 트랜잭션 없으면 즉시 evict (fallback).
 *
 * 예: {@code @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})}
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface CacheEvictAfterCommit {
    String cacheName();
    String[] keys();
}
