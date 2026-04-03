package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
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
    public ListResponse<CouponResponse> getCouponLists() {
        List<CouponEntity> coupons = repository.selectCouponsUser();

        return ListAssembler.assemble(coupons, couponMapStruct::toResponse);  // ✅ MapStruct로 교체
    }

    @Override
//    @Async
    public void recordClick(Long couponId, Long userId) {
        // todo: 회원/비회원이 쿠폰 클릭 시 통계 잡는 function <table> 생성 필요
    }
}
