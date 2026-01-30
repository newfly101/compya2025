package com.dawne.com2usbaseball.domain.coupon.dto.request;

import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record ChangeCouponRequest(
        String couponCode,
        String title,
        String detail,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime expireAt,
        boolean visible
) {
    public CouponEntity toEntity() {
        CouponEntity c = new CouponEntity();
        applyTo(c);
        return c;
    }

    public CouponEntity toEntity(Long id) {
        CouponEntity c = new CouponEntity();
        c.setId(id);
        applyTo(c);
        return c;
    }
    private void applyTo(CouponEntity c) {
        c.setCouponCode(couponCode);
        c.setTitle(title);
        c.setDetail(detail);
        c.setExpireAt(expireAt);
        c.setVisible(visible);
    }
}
