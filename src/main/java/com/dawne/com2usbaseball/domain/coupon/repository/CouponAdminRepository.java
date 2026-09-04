package com.dawne.com2usbaseball.domain.coupon.repository;

import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.repository.mapper.CouponMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CouponAdminRepository {

    private final CouponMapper mapper;

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

    public boolean deleteCoupon(Long id) {
        return mapper.deleteCouponById(id) > 0;
    }

    // 일괄 작업
    public List<Long> selectExistingIds(List<Long> ids) {
        return mapper.selectExistingCouponIds(ids);
    }

    public void deleteCouponsByIds(List<Long> ids) {
        mapper.deleteCouponsByIds(ids);
    }

    public void updateCouponsVisibleByIds(List<Long> ids, boolean visible) {
        mapper.updateCouponsVisibleByIds(ids, visible);
    }
}
