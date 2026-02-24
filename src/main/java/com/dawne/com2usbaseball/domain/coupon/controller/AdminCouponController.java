package com.dawne.com2usbaseball.domain.coupon.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.request.ChangeCouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.request.ChangeCouponVisibleRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.enums.EventMessages;
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
    public ListResponse<CouponResponse> getCouponLists() {
        return couponAdminService.getCouponLists();
    }

    @PostMapping
    public OperationResponse<EventMessages> insertNewCoupons(@RequestBody ChangeCouponRequest request) {
        return couponAdminService.createCoupon(request.toEntity());
    }

    @PatchMapping("/{id}")
    public OperationResponse<EventMessages> updateCoupon(@RequestBody ChangeCouponRequest request, @PathVariable Long id) {
        return couponAdminService.updateCoupon(request.toEntity(id));
    }

    @PatchMapping("/{id}/visible")
    public OperationResponse<EventMessages> updateCouponVisible(@PathVariable Long id, @RequestBody ChangeCouponVisibleRequest request) {
        return couponAdminService.updateCouponVisible(id, request.visible());
    }



}
