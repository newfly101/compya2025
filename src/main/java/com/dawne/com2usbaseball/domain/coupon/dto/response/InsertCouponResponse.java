package com.dawne.com2usbaseball.domain.coupon.dto.response;

public record InsertCouponResponse(
        boolean success,
        String message,
        Long couponId
) {
    public static InsertCouponResponse success(Long couponId) {
        return new InsertCouponResponse(
                true,
                "쿠폰이 성공적으로 등록되었습니다.",
                couponId
        );
    }

    public static InsertCouponResponse fail() {
        return new InsertCouponResponse(
                false,
                "쿠폰 생성에 실패했습니다.",
                null
        );
    }
}
