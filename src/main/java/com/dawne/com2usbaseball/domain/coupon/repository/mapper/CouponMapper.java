package com.dawne.com2usbaseball.domain.coupon.repository.mapper;

import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CouponMapper {

    // 쿠폰
    List<CouponEntity> selectCouponList();

    int insertCoupon(CouponEntity coupon);
    int updateCouponById(CouponEntity coupon);
    int updateCouponVisible(
            @Param("id") Long id,
            @Param("visible") boolean visible);

}
