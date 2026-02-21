package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponListResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.repository.CouponRepository;
import com.dawne.com2usbaseball.domain.coupon.service.support.CouponListMaker;
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
    private final CouponListMaker couponMaker;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value="coupon:public")
    public CouponListResponse getCouponLists() {
        List<CouponEntity> couponEntity = repository.selectCouponsUser();

        return couponMaker.makeCouponListMaker(couponEntity);
    }

    @Override
//    @Async
    public void recordClick(Long couponId, Long userId) {
        // todo: 회원/비회원이 쿠폰 클릭 시 통계 잡는 function <table> 생성 필요
    }
}
