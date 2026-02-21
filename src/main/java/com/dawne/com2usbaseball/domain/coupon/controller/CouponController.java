package com.dawne.com2usbaseball.domain.coupon.controller;

import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponListResponse;
import com.dawne.com2usbaseball.domain.coupon.service.CouponUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponUserService couponUserService;

    @GetMapping
    public CouponListResponse getCouponLists() {
        return couponUserService.getCouponLists();
    }

}
