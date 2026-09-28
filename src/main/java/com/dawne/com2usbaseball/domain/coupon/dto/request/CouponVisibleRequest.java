package com.dawne.com2usbaseball.domain.coupon.dto.request;

import jakarta.validation.constraints.NotNull;

// wrapper + @NotNull — primitive 였을 때는 visible 키를 생략하면 조용히 false 가 되어
// 쿠폰이 의도 없이 숨겨졌다.
public record CouponVisibleRequest(
        @NotNull Boolean visible
) {
}
