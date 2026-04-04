package com.dawne.com2usbaseball.domain.coupon.repository;

import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.repository.mapper.CouponMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CouponRepository {

    private final CouponMapper mapper;

    // public

    public List<CouponEntity> selectCouponsUser() {
        return mapper.selectCouponListForUser();
    }

    // admin

    public List<CouponEntity> selectCoupons() {
        return mapper.selectCouponList();
    }

    public Optional<CouponEntity> findById(Long id) {
        return Optional.ofNullable(mapper.selectCouponById(id));
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
