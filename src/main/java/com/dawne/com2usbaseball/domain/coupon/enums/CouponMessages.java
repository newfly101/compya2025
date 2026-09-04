package com.dawne.com2usbaseball.domain.coupon.enums;

public enum CouponMessages {
    // 쿠폰 조회 성공
    COUPON_SUCCESS,
    COUPON_NOT_FOUND,

    COUPON_CREATED,
    COUPON_CREATED_FAILED,
    COUPON_CODE_DUPLICATED,
    COUPON_UPDATED,
    COUPON_UPDATED_FAILED,
    COUPON_VISIBLE_UPDATED,

    // 삭제 로직 추가 시 사용
    COUPON_DELETED,

    // 일괄 작업
    COUPON_BULK_DELETED,
    COUPON_BULK_VISIBLE_UPDATED
}
