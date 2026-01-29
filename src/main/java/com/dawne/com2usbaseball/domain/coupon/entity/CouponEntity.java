package com.dawne.com2usbaseball.domain.coupon.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponEntity {
    Long id;
    String couponCode;
    String title;
    String detail;
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate startAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    LocalDateTime expireAt;
    boolean visible;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    LocalDateTime createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    LocalDateTime updatedAt;
}
