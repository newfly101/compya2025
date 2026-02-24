package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.enums.EventMessages;
import com.dawne.com2usbaseball.domain.coupon.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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
    @Cacheable(value="coupon:admin")
    public ListResponse<CouponResponse> getCouponLists() {
        List<CouponEntity> coupons = repository.selectCoupons();

        return ListAssembler.assemble(coupons, CouponResponse::from);
    }

    @Override
    @CacheEvict(value={"coupon:admin", "coupon:public"}, allEntries = true)
    public OperationResponse<EventMessages> createCoupon(CouponEntity coupon) {
        return repository.insertCoupon(coupon)
                ? OperationResponse.success(EventMessages.EVENT_CREATED, coupon.getId())
                : OperationResponse.fail(EventMessages.EVENT_FAILED);
    }

    @Override
    @CacheEvict(value={"coupon:admin", "coupon:public"}, allEntries = true)
    public OperationResponse<EventMessages> updateCoupon(CouponEntity coupon) {
        return repository.updateCoupon(coupon)
                ? OperationResponse.success(EventMessages.EVENT_UPDATED, coupon.getId())
                : OperationResponse.fail(EventMessages.EVENT_FAILED);
    }

    @Override
    @CacheEvict(value={"coupon:admin", "coupon:public"}, allEntries = true)
    public OperationResponse<EventMessages> updateCouponVisible(Long id, boolean visible) {
        return repository.updateCouponVisible(id, visible)
                ? OperationResponse.success(EventMessages.EVENT_VISIBLE_UPDATED, id)
                : OperationResponse.fail(EventMessages.EVENT_FAILED);
    }
}
