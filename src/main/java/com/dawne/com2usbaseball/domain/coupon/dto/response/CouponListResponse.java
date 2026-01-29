package com.dawne.com2usbaseball.domain.coupon.dto.response;

import java.util.List;

public record CouponListResponse(
    List<CouponResponse> coupons,
    int totalCount
) {
    public static CouponListResponse of(List<CouponResponse> coupons) {
        return new CouponListResponse(coupons, coupons.size());
    }
}
