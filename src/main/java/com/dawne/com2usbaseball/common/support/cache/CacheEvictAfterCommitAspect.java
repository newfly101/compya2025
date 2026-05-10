package com.dawne.com2usbaseball.common.support.cache;

import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Aspect
@Component
@RequiredArgsConstructor
public class CacheEvictAfterCommitAspect {

    private final CacheManager cacheManager;

    @AfterReturning("@annotation(annotation)")
    public void evictAfterCommit(CacheEvictAfterCommit annotation) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    evictAll(annotation);
                }
            });
        } else {
            evictAll(annotation);
        }
    }

    private void evictAll(CacheEvictAfterCommit annotation) {
        Cache cache = cacheManager.getCache(annotation.cacheName());
        if (cache == null) {
            return;
        }
        for (String key : annotation.keys()) {
            cache.evict(key);
        }
    }
}
