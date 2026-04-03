package com.dawne.com2usbaseball.domain.coupon.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.coupon.controller.docs.CouponSwaggerDocs;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.service.CouponUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/coupons")
public class CouponController implements CouponSwaggerDocs {

    private final CouponUserService couponUserService;

    @Override
    @GetMapping
    public ListResponse<CouponResponse> getCouponLists() {
        return couponUserService.getCouponLists();
    }

}
