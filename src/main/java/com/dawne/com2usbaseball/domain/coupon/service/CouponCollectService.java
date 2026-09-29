package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.domain.coupon.dto.request.CollectedCouponCommand;

import java.util.List;

public interface CouponCollectService {

    /** 카페에서 읽은 쿠폰을 바로 공개로 등록한다. 이미 있는 번호(UNIQUE)는 건너뛰고, 새로 들어간 개수를 돌려준다. */
    int registerCollected(List<CollectedCouponCommand> coupons);
}
