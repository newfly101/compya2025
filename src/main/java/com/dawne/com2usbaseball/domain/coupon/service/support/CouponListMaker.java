package com.dawne.com2usbaseball.domain.coupon.service.support;

import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponListResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CouponListMaker {

    public CouponListResponse makeCouponListMaker(List<CouponEntity> couponList) {
        List<CouponResponse> coupons = couponList.stream()
                .map(CouponResponse::from)
                .toList();

        return CouponListResponse.of(coupons);
    }
}
