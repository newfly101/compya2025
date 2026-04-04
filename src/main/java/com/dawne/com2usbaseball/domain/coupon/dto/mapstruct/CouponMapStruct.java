package com.dawne.com2usbaseball.domain.coupon.dto.mapstruct;

import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CouponMapStruct {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CouponEntity toEntity(CouponRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(CouponRequest request, @MappingTarget CouponEntity entity);

    CouponResponse toResponse(CouponEntity entity);

    List<CouponResponse> toResponseList(List<CouponEntity> entities);
}
