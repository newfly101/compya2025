package com.dawne.com2usbaseball.domain.coupon.dto.mapstruct;

import com.dawne.com2usbaseball.domain.coupon.dto.request.ChangeCouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CouponMapStruct {

    @Mapping(target = "id", ignore = true)
    CouponEntity toEntity(ChangeCouponRequest request);

    CouponResponse toResponse(CouponEntity entity);

    List<CouponResponse> toResponseList(List<CouponEntity> entities);

    default CouponEntity toEntity(ChangeCouponRequest request, Long id) {
        CouponEntity entity = toEntity(request);
        entity.setId(id);
        return entity;
    }
}
