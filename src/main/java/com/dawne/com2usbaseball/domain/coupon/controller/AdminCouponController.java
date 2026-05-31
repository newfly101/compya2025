package com.dawne.com2usbaseball.domain.coupon.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.coupon.controller.docs.AdminCouponSwaggerDocs;
import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponVisibleRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.enums.CouponMessages;
import com.dawne.com2usbaseball.domain.coupon.service.AdminCouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/coupons")
public class AdminCouponController implements AdminCouponSwaggerDocs {

    private final AdminCouponService adminCouponService;

    @Override
    @GetMapping
    public GlobalResponse<List<CouponResponse>> getCouponLists() {
        List<CouponResponse> couponList = adminCouponService.getCouponLists();

        return GlobalResponse.success(CouponMessages.COUPON_SUCCESS, couponList);
    }

    @Override
    @PostMapping
    public GlobalResponse<CouponResponse> insertNewCoupons(@RequestBody CouponRequest request) {
        CouponResponse createdCoupon = adminCouponService.createCoupon(request);
        return GlobalResponse.success(CouponMessages.COUPON_CREATED, createdCoupon);
    }

    @Override
    @PatchMapping("/{id}")
    public GlobalResponse<CouponResponse> updateCoupon(
            @RequestBody CouponRequest request, @PathVariable Long id
    ) {
        CouponResponse updatedCoupon = adminCouponService.updateCoupon(request, id);
        return GlobalResponse.success(CouponMessages.COUPON_UPDATED, updatedCoupon);
    }

    @Override
    @PatchMapping("/{id}/visible")
    public GlobalResponse<Void> updateCouponVisible(
            @PathVariable Long id,
            @RequestBody CouponVisibleRequest request
    ) {
        adminCouponService.updateCouponVisible(id, request.visible());
        return GlobalResponse.success(CouponMessages.COUPON_VISIBLE_UPDATED, null);
    }
}
