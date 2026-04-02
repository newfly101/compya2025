package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.enums.CouponMessages;

public interface CouponAdminService {

    ListResponse<CouponResponse> getCouponLists();
    OperationResponse<CouponMessages> createCoupon(CouponEntity coupon);
    OperationResponse<CouponMessages> updateCoupon(CouponEntity coupon);
    OperationResponse<CouponMessages> updateCouponVisible(Long id, boolean visible);

}
