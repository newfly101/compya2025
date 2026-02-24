package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.enums.EventMessages;

public interface CouponAdminService {

    ListResponse<CouponResponse> getCouponLists();
    OperationResponse<EventMessages> createCoupon(CouponEntity coupon);
    OperationResponse<EventMessages> updateCoupon(CouponEntity coupon);
    OperationResponse<EventMessages> updateCouponVisible(Long id, boolean visible);

}
