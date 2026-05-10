package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.domain.coupon.dto.mapstruct.CouponMapStruct;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponUserServiceImpl implements CouponUserService {

    private final CouponRepository repository;
    private final CouponMapStruct couponMapStruct;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value="coupons", key="'public'")
    public List<CouponResponse> getCouponLists() {
        List<CouponEntity> coupons = repository.selectCouponsUser();

        return couponMapStruct.toResponseList(coupons);
    }
}
