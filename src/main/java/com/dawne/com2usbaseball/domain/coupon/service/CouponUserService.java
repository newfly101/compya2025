package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;

public interface CouponUserService {
    ListResponse<CouponResponse> getCouponLists();
    void recordClick(Long couponId, Long userId);
}
