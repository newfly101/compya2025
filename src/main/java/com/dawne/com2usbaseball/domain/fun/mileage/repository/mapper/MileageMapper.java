package com.dawne.com2usbaseball.domain.fun.mileage.repository.mapper;

import com.dawne.com2usbaseball.domain.fun.mileage.entity.MileageSniperTargetEntity;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface MileageMapper {

    /** 구단×연도×포지션에 선수가 한 명뿐인 조합 중 레전드 재료인 카드 전량(119건). 조건이 없다. */
    List<MileageSniperTargetEntity> findSniperTargets();
}
