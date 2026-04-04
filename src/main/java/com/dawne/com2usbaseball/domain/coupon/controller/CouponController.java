package com.dawne.com2usbaseball.domain.coupon.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.coupon.controller.docs.CouponSwaggerDocs;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.enums.CouponMessages;
import com.dawne.com2usbaseball.domain.coupon.service.CouponUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/coupons")
public class CouponController implements CouponSwaggerDocs {

    private final CouponUserService couponUserService;

    @Override
    @GetMapping
    public GlobalResponse<List<CouponResponse>> getCouponLists() {
        List<CouponResponse> couponList = couponUserService.getCouponLists();

        return GlobalResponse.success(CouponMessages.COUPON_SUCCESS,couponList);
    }

}
