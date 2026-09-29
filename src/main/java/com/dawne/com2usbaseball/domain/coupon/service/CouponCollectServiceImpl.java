package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.cache.CacheEvictAfterCommit;
import com.dawne.com2usbaseball.domain.coupon.dto.request.CollectedCouponCommand;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.repository.CouponAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponCollectServiceImpl implements CouponCollectService {

    private final CouponAdminRepository repository;

    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
    public int registerCollected(List<CollectedCouponCommand> coupons) {
        int created = 0;
        for (CollectedCouponCommand c : coupons) {
            CouponEntity entity = CouponEntity.builder()
                    .couponCode(cut(c.couponCode(), 100))
                    .title(cut(c.title(), 255))
                    .detail(cut(c.detail(), 500))
                    .expireAt(c.expireAt())
                    .visible(true) // 쿠폰은 승인 없이 바로 공개 (운영자 결정 2026-09-30)
                    .build();
            if (repository.insertCouponIfAbsent(entity)) {
                created++;
            }
        }
        return created;
    }

    private static String cut(String s, int max) {
        return s == null || s.length() <= max ? s : s.substring(0, max);
    }
}
