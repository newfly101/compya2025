package com.dawne.com2usbaseball.domain.coupon.dto.request;

import jakarta.validation.constraints.Size;

// 길이 상한은 site_coupons 컬럼 기준. PATCH 가 부분 수정(전달한 필드만 UPDATE)이라
// 필수 여부(@NotBlank)는 걸지 않는다 — 걸면 부분 수정이 막힌다.
public record CouponRequest(
        @Size(max = 100) String couponCode,
        @Size(max = 255) String title,
        @Size(max = 500) String detail,
        // expireAt 은 "yyyy-MM-dd"(날짜만) / "yyyy-MM-dd HH:mm" / "yyyy-MM-dd HH:mm:ss" 가 섞여 온다.
        // LocalDateTime + @JsonFormat 고정 패턴으로는 날짜만 온 값을 파싱하지 못하므로(400),
        // 이벤트와 같이 문자열로 받아 서비스 레이어에서 DateTimeUtils 로 초 단위 정규화한다.
        String expireAt,
        Boolean visible
) { }
