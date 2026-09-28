package com.dawne.com2usbaseball.domain.coupon.dto.mapstruct;

import com.dawne.com2usbaseball.domain.coupon.dto.request.CouponRequest;
import com.dawne.com2usbaseball.domain.coupon.dto.response.CouponResponse;
import com.dawne.com2usbaseball.domain.coupon.entity.CouponEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CouponMapStruct {

    // expireAt 은 요청이 String, 엔티티는 LocalDateTime 이라 자동 매핑이 불가능하다.
    // 서비스 레이어에서 초 단위 정규화 후 별도로 채운다.
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "expireAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CouponEntity toEntity(CouponRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "expireAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(CouponRequest request, @MappingTarget CouponEntity entity);

    CouponResponse toResponse(CouponEntity entity);

    List<CouponResponse> toResponseList(List<CouponEntity> entities);
}
