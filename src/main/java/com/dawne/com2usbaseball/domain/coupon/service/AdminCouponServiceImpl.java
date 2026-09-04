package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.cache.CacheEvictAfterCommit;
import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
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

    // 일괄 삭제 — 존재하는 id만 처리(soft delete), 존재하지 않는 id는 실패 목록으로 반환(전체 롤백 X)
    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
    public BulkOperationResponse bulkDeleteCoupons(List<Long> ids) {
        List<Long> requestedIds = normalizeIds(ids);
        if (requestedIds.isEmpty()) {
            return BulkOperationResponse.empty();
        }

        List<Long> existingIds = repository.selectExistingIds(requestedIds);
        List<Long> failedIds = requestedIds.stream().filter(id -> !existingIds.contains(id)).toList();

        if (!existingIds.isEmpty()) {
            repository.deleteCouponsByIds(existingIds);
        }
        return BulkOperationResponse.of(existingIds, failedIds);
    }

    // 일괄 노출 여부 변경 — 위와 동일한 부분 실패 처리 방식
    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
    public BulkOperationResponse bulkUpdateCouponsVisible(List<Long> ids, boolean visible) {
        List<Long> requestedIds = normalizeIds(ids);
        if (requestedIds.isEmpty()) {
            return BulkOperationResponse.empty();
        }

        List<Long> existingIds = repository.selectExistingIds(requestedIds);
        List<Long> failedIds = requestedIds.stream().filter(id -> !existingIds.contains(id)).toList();

        if (!existingIds.isEmpty()) {
            repository.updateCouponsVisibleByIds(existingIds, visible);
        }
        return BulkOperationResponse.of(existingIds, failedIds);
    }

    private List<Long> normalizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return ids.stream().filter(java.util.Objects::nonNull).distinct().toList();
    }
}
