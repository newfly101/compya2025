package com.dawne.com2usbaseball.domain.coupon.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

// 길이 상한은 site_coupons 컬럼 기준. PATCH 가 부분 수정(전달한 필드만 UPDATE)이라
// 필수 여부(@NotBlank)는 걸지 않는다 — 걸면 부분 수정이 막힌다.
public record CouponRequest(
        @Size(max = 100) String couponCode,
        @Size(max = 255) String title,
        @Size(max = 500) String detail,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime expireAt,
        Boolean visible
) { }
