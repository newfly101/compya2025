package com.dawne.com2usbaseball.domain.coupon.dto.response;

import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;

import java.time.LocalDateTime;

public record CouponResponse(
        Long id,
        String couponCode,
        String title,
        String detail,
        LocalDateTime expireAt,
        boolean visible
) {
    public static CouponResponse from(CouponEntity c) {
        return new CouponResponse(
                c.getId(),
                c.getCouponCode(),
                c.getTitle(),
                c.getDetail(),
                c.getExpireAt(),
                c.isVisible()
        );
    }
}
