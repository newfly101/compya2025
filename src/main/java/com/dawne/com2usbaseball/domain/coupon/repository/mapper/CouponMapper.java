package com.dawne.com2usbaseball.domain.coupon.repository.mapper;

import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CouponMapper {

    // user
    List<CouponEntity> selectCouponListForUser();

    // admin
    List<CouponEntity> selectCouponList();
    int insertCoupon(CouponEntity coupon);
    CouponEntity selectCouponById(@Param("id") Long id);
    int updateCouponById(CouponEntity coupon);
    int updateCouponVisible(
            @Param("id") Long id,
            @Param("visible") boolean visible);

    int deleteCouponById(@Param("id") Long id);

    // 일괄 작업
    List<Long> selectExistingCouponIds(@Param("ids") List<Long> ids);
    int deleteCouponsByIds(@Param("ids") List<Long> ids);
    int updateCouponsVisibleByIds(
            @Param("ids") List<Long> ids,
            @Param("visible") boolean visible);

}
