package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponListResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.InsertCouponResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.UpdateCouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.repository.CouponRepository;
import com.dawne.com2usbaseball.domain.coupon.service.support.CouponListMaker;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponServiceImpl implements CouponService {

    private final CouponRepository repository;
    private final CouponListMaker couponMaker;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value="couponLists")
    public CouponListResponse getCouponLists() {
        List<CouponEntity> couponEntity = repository.selectCoupons();

        return couponMaker.makeCouponListMaker(couponEntity);
    }

    @Override
    @CacheEvict(value="couponLists", allEntries = true)
    public InsertCouponResponse createCoupon(CouponEntity coupon) {
        boolean success = repository.insertCoupon(coupon);

        if (!success) {
            return InsertCouponResponse.fail();
        }

        return InsertCouponResponse.success(coupon.getId());
    }

    @Override
    @CacheEvict(value="couponLists", allEntries = true)
    public UpdateCouponResponse updateCoupon(CouponEntity coupon) {
        boolean success = repository.updateCoupon(coupon);
        if (!success) {
            return UpdateCouponResponse.fail();
        }

        return UpdateCouponResponse.success(coupon.getId());
    }

    @Override
    public UpdateCouponResponse updateCouponVisible(Long id, boolean visible) {
        boolean success = repository.updateCouponVisible(id, visible);
        if (!success) {
            return UpdateCouponResponse.fail();
        }

        return UpdateCouponResponse.success(id);
    }
}
