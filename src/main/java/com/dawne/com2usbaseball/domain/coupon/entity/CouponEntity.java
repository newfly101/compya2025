package com.dawne.com2usbaseball.domain.coupon.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponEntity {
    Long id;
    String couponCode;
    String title;
    String detail;
    LocalDateTime expireAt;
    boolean visible;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
