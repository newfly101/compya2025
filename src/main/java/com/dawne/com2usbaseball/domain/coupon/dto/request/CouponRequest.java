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
        // 초는 선택 — 어드민이 만료 시각을 비우면 "그날 끝"(23:59:59)을 보내고, 시각을 지정하면
        // 분 단위(HH:mm)로 보낸다. 응답(CouponResponse)은 분 단위 포맷이라 초는 표시되지 않는다.
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm[:ss]")
        LocalDateTime expireAt,
        Boolean visible
) { }
