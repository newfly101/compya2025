package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;

import java.util.List;

public interface CouponUserService {
    List<CouponResponse> getCouponLists();
}
