package com.dawne.com2usbaseball.domain.coupon.dto.request;

import java.time.LocalDateTime;

/** 공식 카페 자동 수집이 넘기는 쿠폰 한 건 (event 도메인 → coupon 도메인 오케스트레이션용) */
public record CollectedCouponCommand(String couponCode, String title, String detail, LocalDateTime expireAt) { }
