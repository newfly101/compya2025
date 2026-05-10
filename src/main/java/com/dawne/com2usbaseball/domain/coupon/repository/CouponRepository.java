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

    public List<CouponEntity> selectCouponsUser() {
        return mapper.selectCouponListForUser();
    }
}
