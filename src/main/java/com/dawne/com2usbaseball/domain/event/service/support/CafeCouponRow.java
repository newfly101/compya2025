package com.dawne.com2usbaseball.domain.event.service.support;

import java.time.LocalDateTime;

/** 쿠폰 표 한 행. registrable() 이 true 인 행만 등록한다. */
public record CafeCouponRow(
        String couponCode,
        String title,
        String detail,
        LocalDateTime expireAt,
        boolean pending,
        boolean columnMismatch
) {
    /** 번호 형식이 맞고, 기한을 읽었고, 칸 수가 어긋나지 않았고, 아직 기한이 안 지났다 */
    public boolean registrable(LocalDateTime now) {
        return !pending && !columnMismatch && expireAt != null && expireAt.isAfter(now)
                && title != null && !title.isBlank();
    }
}
