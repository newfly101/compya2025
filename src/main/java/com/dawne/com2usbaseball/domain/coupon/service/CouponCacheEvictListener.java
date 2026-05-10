package com.dawne.com2usbaseball.domain.coupon.service;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class CouponCacheEvictListener {

    private final CacheManager cacheManager;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCouponCacheEvict(CouponCacheEvictEvent event) {
        Cache cache = cacheManager.getCache("coupons");
        if (cache == null) {
            return;
        }
        cache.evict("admin");
        cache.evict("public");
    }
}
