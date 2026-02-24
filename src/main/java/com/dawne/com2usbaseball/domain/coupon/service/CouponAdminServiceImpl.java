package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.enums.CouponMessages;
import com.dawne.com2usbaseball.domain.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponAdminServiceImpl implements CouponAdminService {

    private final CouponRepository repository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value="coupons", key="'admin'")
    public ListResponse<CouponResponse> getCouponLists() {
        List<CouponEntity> coupons = repository.selectCoupons();

        return ListAssembler.assemble(coupons, CouponResponse::from);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value="coupons", key="'admin'", condition="#result.success == true"),
            @CacheEvict(value="coupons", key="'public'", condition="#result.success == true")
    })
    public OperationResponse<CouponMessages> createCoupon(CouponEntity coupon) {
        return repository.insertCoupon(coupon)
                ? OperationResponse.success(CouponMessages.COUPON_CREATED, coupon.getId())
                : OperationResponse.fail(CouponMessages.COUPON_FAILED);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value="coupons", key="'admin'", condition="#result.success == true"),
            @CacheEvict(value="coupons", key="'public'", condition="#result.success == true")
    })
    public OperationResponse<CouponMessages> updateCoupon(CouponEntity coupon) {
        return repository.updateCoupon(coupon)
                ? OperationResponse.success(CouponMessages.COUPON_UPDATED, coupon.getId())
                : OperationResponse.fail(CouponMessages.COUPON_FAILED);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value="coupons", key="'admin'", condition="#result.success == true"),
            @CacheEvict(value="coupons", key="'public'", condition="#result.success == true")
    })
    public OperationResponse<CouponMessages> updateCouponVisible(Long id, boolean visible) {
        return repository.updateCouponVisible(id, visible)
                ? OperationResponse.success(CouponMessages.COUPON_VISIBLE_UPDATED, id)
                : OperationResponse.fail(CouponMessages.COUPON_FAILED);
    }
}
