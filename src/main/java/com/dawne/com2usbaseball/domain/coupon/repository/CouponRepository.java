package com.dawne.com2usbaseball.domain.coupon.repository;

import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.repository.mapper.CouponMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class CouponRepository {

    private final CouponMapper mapper;

    public List<CouponEntity> selectCoupons() {
        return mapper.selectCouponList();
    }

    public boolean insertCoupon(CouponEntity coupon) {
        return mapper.insertCoupon(coupon) > 0;
    }

    public boolean updateCoupon(CouponEntity coupon) {
        return mapper.updateCouponById(coupon) > 0;
    }

    public boolean updateCouponVisible(Long couponId, boolean visible) {
        return mapper.updateCouponVisible(couponId, visible) > 0;
    }


}
