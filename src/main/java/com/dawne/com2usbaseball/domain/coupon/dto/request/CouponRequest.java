package com.dawne.com2usbaseball.domain.coupon.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record CouponRequest(
        String couponCode,
        String title,
        String detail,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime expireAt,
        boolean visible
) { }
