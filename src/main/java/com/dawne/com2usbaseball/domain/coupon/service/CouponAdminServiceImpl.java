package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.domain.coupon.dto.mapstruct.CouponMapStruct;
import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.enums.CouponMessages;
import com.dawne.com2usbaseball.domain.coupon.exception.CouponException;
import com.dawne.com2usbaseball.domain.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponAdminServiceImpl implements CouponAdminService {

    private final CouponRepository repository;
    private final CouponMapStruct couponMapStruct;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "coupons", key = "'admin'")
    public List<CouponResponse> getCouponLists() {
        List<CouponEntity> coupons = repository.selectCoupons();

        return couponMapStruct.toResponseList(coupons);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "coupons", key = "'admin'"),
            @CacheEvict(value = "coupons", key = "'public'")
    })
    public CouponResponse createCoupon(CouponRequest request) {
        CouponEntity coupon = couponMapStruct.toEntity(request);
        if (!repository.insertCoupon(coupon)) {
            throw new CouponException(CouponMessages.COUPON_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        CouponEntity saved = repository.findById(coupon.getId())
                .orElseThrow(() -> new CouponException(CouponMessages.COUPON_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));

        return couponMapStruct.toResponse(saved);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "coupons", key = "'admin'"),
            @CacheEvict(value = "coupons", key = "'public'")
    })
    public CouponResponse updateCoupon(CouponRequest request, Long id) {
        CouponEntity coupon = repository.findById(id)
                .orElseThrow(() -> new CouponException(CouponMessages.COUPON_NOT_FOUND, HttpStatus.NOT_FOUND));

        couponMapStruct.updateEntity(request, coupon);

        if (!repository.updateCoupon(coupon)) {
            throw new CouponException(CouponMessages.COUPON_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return couponMapStruct.toResponse(coupon);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "coupons", key = "'admin'"),
            @CacheEvict(value = "coupons", key = "'public'")
    })
    public void updateCouponVisible(Long id, boolean visible) {
        if (!repository.updateCouponVisible(id, visible)) {
            throw new CouponException(CouponMessages.COUPON_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
    }
}
