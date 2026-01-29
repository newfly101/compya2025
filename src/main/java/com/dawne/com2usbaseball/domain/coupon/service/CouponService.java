package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponListResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.InsertCouponResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.UpdateCouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;

public interface CouponService {

    CouponListResponse getCouponLists();

    InsertCouponResponse createCoupon(CouponEntity coupon);
    UpdateCouponResponse updateCoupon(CouponEntity coupon);
    UpdateCouponResponse updateCouponVisible(Long id, boolean visible);

}
