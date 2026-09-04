package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;

import java.util.List;

public interface AdminCouponService {

    List<CouponResponse> getCouponLists();
    CouponResponse createCoupon(CouponRequest request);
    CouponResponse updateCoupon(CouponRequest request, Long id);
    void updateCouponVisible(Long id, boolean visible);
    void deleteCoupon(Long id);

    // 일괄 작업
    BulkOperationResponse bulkDeleteCoupons(List<Long> ids);
    BulkOperationResponse bulkUpdateCouponsVisible(List<Long> ids, boolean visible);

}
