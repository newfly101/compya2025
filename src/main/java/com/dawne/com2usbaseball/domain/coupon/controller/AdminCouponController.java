package com.dawne.com2usbaseball.domain.coupon.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.coupon.controller.docs.AdminCouponSwaggerDocs;
import com.dawne.com2usbaseball.domain.coupon.dto.request.ChangeCouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.request.ChangeCouponVisibleRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.enums.CouponMessages;
import com.dawne.com2usbaseball.domain.coupon.service.CouponAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/coupons")
public class AdminCouponController implements AdminCouponSwaggerDocs {

    private final CouponAdminService couponAdminService;

    @Override
    @GetMapping
    public ListResponse<CouponResponse> getCouponLists() {
        return couponAdminService.getCouponLists();
    }

    @Override
    @PostMapping
    public OperationResponse<CouponMessages> insertNewCoupons(@RequestBody ChangeCouponRequest request) {
        return couponAdminService.createCoupon(request.toEntity());
    }

    @Override
    @PatchMapping("/{id}")
    public OperationResponse<CouponMessages> updateCoupon(@RequestBody ChangeCouponRequest request, @PathVariable Long id) {
        return couponAdminService.updateCoupon(request.toEntity(id));
    }

    @Override
    @PatchMapping("/{id}/visible")
    public OperationResponse<CouponMessages> updateCouponVisible(@PathVariable Long id, @RequestBody ChangeCouponVisibleRequest request) {
        return couponAdminService.updateCouponVisible(id, request.visible());
    }



}
