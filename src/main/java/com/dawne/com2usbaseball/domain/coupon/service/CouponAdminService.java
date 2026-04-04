package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;

import java.util.List;

public interface CouponAdminService {

    List<CouponResponse> getCouponLists();
    CouponResponse createCoupon(CouponRequest request);
    CouponResponse updateCoupon(CouponRequest request, Long id);
    void updateCouponVisible(Long id, boolean visible);

}
