package com.dawne.com2usbaseball.domain.fun.mileage.repository;

import com.dawne.com2usbaseball.domain.fun.mileage.entity.MileageSniperTargetEntity;
import com.dawne.com2usbaseball.domain.fun.mileage.repository.mapper.MileageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MileageRepository {

    private final MileageMapper mileageMapper;

    public List<MileageSniperTargetEntity> findSniperTargets() {
        return mileageMapper.findSniperTargets();
    }
}
