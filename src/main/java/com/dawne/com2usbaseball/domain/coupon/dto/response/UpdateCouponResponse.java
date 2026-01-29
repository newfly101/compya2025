package com.dawne.com2usbaseball.domain.coupon.dto.response;

public record UpdateCouponResponse(
        boolean success,
        String message,
        Long couponId
) {
    public static UpdateCouponResponse success(Long couponId) {
        return new UpdateCouponResponse(
                true,
                "이벤트가 성공적으로 등록되었습니다.",
                couponId
        );
    }

    public static UpdateCouponResponse fail() {
        return new UpdateCouponResponse(
                false,
                "이벤트 생성에 실패했습니다.",
                null
        );
    }
}
