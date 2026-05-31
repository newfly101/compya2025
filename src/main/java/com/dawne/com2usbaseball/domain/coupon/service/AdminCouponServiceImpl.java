package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.cache.CacheEvictAfterCommit;
import com.dawne.com2usbaseball.domain.coupon.dto.mapstruct.CouponMapStruct;
import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.enums.CouponMessages;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.coupon.repository.CouponAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminCouponServiceImpl implements AdminCouponService {

    private final CouponAdminRepository repository;
    private final CouponMapStruct couponMapStruct;

    @Override
    @Cacheable(value = "coupons", key = "'admin'")
    public List<CouponResponse> getCouponLists() {
        List<CouponEntity> coupons = repository.selectCoupons();

        return couponMapStruct.toResponseList(coupons);
    }

    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
    public CouponResponse createCoupon(CouponRequest request) {
        CouponEntity coupon = couponMapStruct.toEntity(request);
        try {
            if (!repository.insertCoupon(coupon)) {
                throw new BaseException(CouponMessages.COUPON_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            CouponEntity saved = repository.findById(coupon.getId())
                    .orElseThrow(() -> new BaseException(CouponMessages.COUPON_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));

            return couponMapStruct.toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            throw new BaseException(CouponMessages.COUPON_CODE_DUPLICATED, HttpStatus.CONFLICT);
        }
    }

    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
    public CouponResponse updateCoupon(CouponRequest request, Long id) {
        CouponEntity coupon = repository.findById(id)
                .orElseThrow(() -> new BaseException(CouponMessages.COUPON_NOT_FOUND, HttpStatus.NOT_FOUND));

        couponMapStruct.updateEntity(request, coupon);

        if (!repository.updateCoupon(coupon)) {
            throw new BaseException(CouponMessages.COUPON_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return couponMapStruct.toResponse(coupon);
    }

    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
    public void updateCouponVisible(Long id, boolean visible) {
        repository.findById(id)
                .orElseThrow(() -> new BaseException(CouponMessages.COUPON_NOT_FOUND, HttpStatus.NOT_FOUND));
        repository.updateCouponVisible(id, visible);
    }

    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
    public void deleteCoupon(Long id) {
        repository.findById(id)
                .orElseThrow(() -> new BaseException(CouponMessages.COUPON_NOT_FOUND, HttpStatus.NOT_FOUND));
        repository.deleteCoupon(id);
    }
}
