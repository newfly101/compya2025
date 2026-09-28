package com.dawne.com2usbaseball.domain.coupon.service;

import com.dawne.com2usbaseball.common.support.cache.CacheEvictAfterCommit;
import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
import com.dawne.com2usbaseball.common.util.DateTimeUtils;
import com.dawne.com2usbaseball.domain.coupon.dto.mapstruct.CouponMapStruct;
import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import com.dawne.com2usbaseball.domain.coupon.enums.CouponMessages;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.coupon.repository.CouponAdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    // 운영자가 DB 에 직접 반영한 변경사항을 즉시 앱에 반영하기 위해 캐시를 비우고 최신 목록을 다시 조회
    // 자기호출(getCouponLists) 시 AOP 프록시를 우회해 캐시가 안 타므로 repository 를 직접 호출한다
    @Override
    @Transactional(readOnly = true)
    @CacheEvict(value = "coupons", allEntries = true)
    public List<CouponResponse> refreshCoupons() {
        List<CouponEntity> coupons = repository.selectCoupons();

        return couponMapStruct.toResponseList(coupons);
    }

    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
    public CouponResponse createCoupon(CouponRequest request) {
        CouponEntity coupon = couponMapStruct.toEntity(request);
        coupon.setExpireAt(normalizeExpireAt(request));
        try {
            if (!repository.insertCoupon(coupon)) {
                throw new BaseException(CouponMessages.COUPON_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            CouponEntity saved = repository.findById(coupon.getId())
                    .orElseThrow(() -> new BaseException(CouponMessages.COUPON_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));

            return couponMapStruct.toResponse(saved);
        } catch (DuplicateKeyException e) {
            throw toCouponCodeConflict(e);
        }
    }

    @Override
    @Transactional
    @CacheEvictAfterCommit(cacheName = "coupons", keys = {"admin", "public"})
    public CouponResponse updateCoupon(CouponRequest request, Long id) {
        CouponEntity coupon = repository.findById(id)
                .orElseThrow(() -> new BaseException(CouponMessages.COUPON_NOT_FOUND, HttpStatus.NOT_FOUND));

        couponMapStruct.updateEntity(request, coupon);

        // 부분 수정 허용 — 값이 안 온 필드는 기존 값을 유지(정규화 결과가 null 이면 건드리지 않음)
        LocalDateTime expireAt = normalizeExpireAt(request);
        if (expireAt != null) {
            coupon.setExpireAt(expireAt);
        }

        try {
            if (!repository.updateCoupon(coupon)) {
                throw new BaseException(CouponMessages.COUPON_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (DuplicateKeyException e) {
            throw toCouponCodeConflict(e);
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

    // 일괄 삭제 — 존재하는 id만 노출 끄기(is_visible=false), 존재하지 않는 id는 실패 목록으로 반환(전체 롤백 X)
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

    // 중복으로 볼 수 있는 것은 coupon_code UNIQUE 위반 하나뿐이다 — title/detail 길이 초과나
    // NOT NULL 위반까지 같이 409 "코드 중복" 으로 바꾸면 관리자가 원인과 무관한 메시지를 보고
    // 코드만 바꿔가며 재시도한다. 인라인 UNIQUE(이름 없음)라 MariaDB 가 인덱스명을 컬럼명으로 부여한다.
    private RuntimeException toCouponCodeConflict(DuplicateKeyException e) {
        String message = e.getMostSpecificCause().getMessage();
        if (message == null || !message.contains("coupon_code")) {
            return e; // 다른 제약 위반은 원래 예외를 그대로 올린다
        }
        return new BaseException(CouponMessages.COUPON_CODE_DUPLICATED, HttpStatus.CONFLICT);
    }

    // 날짜만 오면 그날 끝(23:59:59), 분까지만 오면 0초를 채운다 — 이벤트 기간과 같은 규칙.
    private LocalDateTime normalizeExpireAt(CouponRequest request) {
        return DateTimeUtils.normalize(
                request.expireAt(),
                DateTimeUtils.DEFAULT_EXPIRE_TIME,
                CouponMessages.COUPON_EXPIRE_AT_INVALID_FORMAT
        );
    }

    private List<Long> normalizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return ids.stream().filter(java.util.Objects::nonNull).distinct().toList();
    }
}
