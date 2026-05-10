package com.dawne.com2usbaseball.domain.coupon.entity;

import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponEntity {
    private Long id;
    private String couponCode;
    private String title;
    private String detail;
    private LocalDateTime expireAt;
    private boolean visible;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
