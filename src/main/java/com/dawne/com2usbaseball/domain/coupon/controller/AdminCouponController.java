package com.dawne.com2usbaseball.domain.coupon.controller;

import com.dawne.com2usbaseball.domain.coupon.dto.request.ChangeCouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.request.ChangeCouponVisibleRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponListResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.InsertCouponResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.UpdateCouponResponse;
import com.dawne.com2usbaseball.domain.coupon.service.CouponAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/coupons")
public class AdminCouponController {

    private final CouponAdminService couponAdminService;

    @GetMapping
    public CouponListResponse getCouponLists() {
        return couponAdminService.getCouponLists();
    }

    @PostMapping
    public InsertCouponResponse insertNewCoupons(@RequestBody ChangeCouponRequest request) {
        return couponAdminService.createCoupon(request.toEntity());
    }

    @PatchMapping("/{id}")
    public UpdateCouponResponse updateCoupon(@RequestBody ChangeCouponRequest request, @PathVariable Long id) {
        return couponAdminService.updateCoupon(request.toEntity(id));
    }

    @PatchMapping("/{id}/visible")
    public UpdateCouponResponse updateCouponVisible(@PathVariable Long id, @RequestBody ChangeCouponVisibleRequest request) {
        return couponAdminService.updateCouponVisible(id, request.visible());
    }



}
