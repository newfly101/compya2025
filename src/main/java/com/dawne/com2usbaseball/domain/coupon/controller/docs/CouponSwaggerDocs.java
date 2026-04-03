package com.dawne.com2usbaseball.domain.coupon.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "1. [Site] Coupon", description = "사용자 쿠폰 조회 API")
public interface CouponSwaggerDocs {

    @Operation(
            summary = "쿠폰 목록 조회",
            description = "사용자가 노출 가능한 쿠폰 목록을 조회한다."
    )
    @ApiResponse(responseCode = "200", description = "쿠폰 목록 조회 성공")
    ListResponse<CouponResponse> getCouponLists();
}
