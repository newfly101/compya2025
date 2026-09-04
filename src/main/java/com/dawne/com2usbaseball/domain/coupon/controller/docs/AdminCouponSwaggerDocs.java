package com.dawne.com2usbaseball.domain.coupon.controller.docs;

import com.dawne.com2usbaseball.common.support.dto.BulkIdsRequest;
import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
import com.dawne.com2usbaseball.common.support.dto.BulkVisibleRequest;
import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponVisibleRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "1. [Site] Coupon", description = "관리자 쿠폰 관리 API")
public interface AdminCouponSwaggerDocs {

    @Operation(
            summary = "쿠폰 목록 조회",
            description = "관리자가 등록된 쿠폰 목록을 조회한다."
    )
    @ApiResponse(responseCode = "200", description = "쿠폰 목록 조회 성공")
    GlobalResponse<List<CouponResponse>> getCouponLists();

    @Operation(
            summary = "쿠폰 등록",
            description = "관리자가 신규 쿠폰을 등록한다."
    )
    @ApiResponse(responseCode = "200", description = "쿠폰 등록 성공")
    @ApiResponse(responseCode = "400", description = "잘못된 요청", content = @Content)
    GlobalResponse<CouponResponse> insertNewCoupons(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "쿠폰 등록 요청 값",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = CouponRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "쿠폰 등록 예시",
                                            summary = "신규 쿠폰 등록 샘플",
                                            value = """
                                                {
                                                  "couponCode": "WELCOME_2026",
                                                  "title": "신규 가입 웰컴 쿠폰",
                                                  "detail": "회원가입 사용자 대상 10% 할인 쿠폰",
                                                  "expireAt": "2026-12-31 23:59:59",
                                                  "visible": true
                                                }
                                                """
                                    )
                            }
                    )
            )
            @RequestBody CouponRequest request
    );

    @Operation(
            summary = "쿠폰 수정",
            description = "관리자가 기존 쿠폰 정보를 수정한다."
    )
    @ApiResponse(responseCode = "200", description = "쿠폰 수정 성공")
    @ApiResponse(responseCode = "404", description = "쿠폰을 찾을 수 없음", content = @Content)
    GlobalResponse<CouponResponse> updateCoupon(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "쿠폰 수정 요청 값",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = CouponRequest.class),
                            examples = {
                                    @ExampleObject(
                                            name = "쿠폰 수정 예시",
                                            summary = "기존 쿠폰 수정 샘플",
                                            value = """
                                                {
                                                  "couponCode": "SPRING_2026",
                                                  "title": "봄맞이 할인 쿠폰",
                                                  "detail": "전 상품 5% 할인",
                                                  "expireAt": "2026-04-30 23:59:59",
                                                  "visible": false
                                                }
                                                """
                                    )
                            }
                    )
            )
            @RequestBody CouponRequest request,

            @Parameter(description = "쿠폰 ID", required = true, example = "1")
            @PathVariable Long id
    );

    @Operation(
            summary = "쿠폰 노출 여부 수정",
            description = "관리자가 쿠폰의 노출 여부를 변경한다."
    )
    @ApiResponse(responseCode = "200", description = "쿠폰 노출 여부 수정 성공")
    @ApiResponse(responseCode = "404", description = "쿠폰을 찾을 수 없음", content = @Content)
    GlobalResponse<Void> updateCouponVisible(
            @Parameter(description = "쿠폰 ID", required = true, example = "1")
            @PathVariable Long id,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "쿠폰 노출 여부 변경 요청 값",
                    required = true,
                    content = @Content(schema = @Schema(implementation = CouponVisibleRequest.class))
            )
            @RequestBody CouponVisibleRequest request
    );

    @Operation(
            summary = "쿠폰 삭제",
            description = "관리자가 쿠폰을 삭제(비활성화)한다."
    )
    @ApiResponse(responseCode = "200", description = "쿠폰 삭제 성공")
    @ApiResponse(responseCode = "404", description = "쿠폰을 찾을 수 없음", content = @Content)
    GlobalResponse<Void> deleteCoupon(
            @Parameter(description = "쿠폰 ID", required = true, example = "1")
            @PathVariable Long id
    );

    @Operation(
            summary = "쿠폰 일괄 삭제",
            description = "관리자가 여러 쿠폰을 한 번에 삭제(비활성화)한다. 존재하지 않는 id는 failedIds로 반환되며 전체 요청은 실패하지 않는다."
    )
    @ApiResponse(responseCode = "200", description = "쿠폰 일괄 삭제 처리 완료")
    GlobalResponse<BulkOperationResponse> bulkDeleteCoupons(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "삭제할 쿠폰 id 목록",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = BulkIdsRequest.class),
                            examples = @ExampleObject(value = "{ \"ids\": [1, 2, 3] }")
                    )
            )
            @RequestBody BulkIdsRequest request
    );

    @Operation(
            summary = "쿠폰 일괄 노출 여부 변경",
            description = "관리자가 여러 쿠폰의 노출 여부를 한 번에 변경한다. 존재하지 않는 id는 failedIds로 반환되며 전체 요청은 실패하지 않는다."
    )
    @ApiResponse(responseCode = "200", description = "쿠폰 일괄 노출 여부 변경 처리 완료")
    GlobalResponse<BulkOperationResponse> bulkUpdateCouponsVisible(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "노출 여부를 변경할 쿠폰 id 목록과 변경값",
                    required = true,
                    content = @Content(
                            schema = @Schema(implementation = BulkVisibleRequest.class),
                            examples = @ExampleObject(value = "{ \"ids\": [1, 2, 3], \"visible\": false }")
                    )
            )
            @RequestBody BulkVisibleRequest request
    );
}
