package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponListResponse;

public interface CouponUserService {
    CouponListResponse getCouponLists();
    void recordClick(Long couponId, Long userId);
}
