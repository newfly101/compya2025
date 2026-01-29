package com.dawne.com2usbaseball.domain.coupon.controller;

import com.dawne.com2usbaseball.domain.coupon.dto.request.ChangeCouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.request.ChangeCouponVisibleRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponListResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.InsertCouponResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.UpdateCouponResponse;
import com.dawne.com2usbaseball.domain.coupon.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    @GetMapping
    public CouponListResponse getCouponLists() {
        return couponService.getCouponLists();
    }

    @PostMapping
    public InsertCouponResponse insertNewCoupons(@RequestBody ChangeCouponRequest request) {
        return couponService.createCoupon(request.toEntity());
    }

    @PatchMapping("/{id}")
    public UpdateCouponResponse updateCoupon(@RequestBody ChangeCouponRequest request, @PathVariable Long id) {
        return couponService.updateCoupon(request.toEntity(id));
    }

    @PatchMapping("/{id}/visible")
    public UpdateCouponResponse updateCouponVisible(@PathVariable Long id, @RequestBody ChangeCouponVisibleRequest request) {
        return couponService.updateCouponVisible(id, request.visible());
    }



}
