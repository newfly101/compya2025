package com.dawne.com2usbaseball.domain.coupon.dto.response;

import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record CouponResponse(
        Long id,
        String couponCode,
        String title,
        String detail,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
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
