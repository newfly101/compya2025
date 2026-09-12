package com.dawne.com2usbaseball.domain.fun.mileage.service;

import com.dawne.com2usbaseball.domain.fun.mileage.dto.MileageSnapshot;
import com.dawne.com2usbaseball.domain.fun.mileage.dto.response.MileageSniperTargetResponse;
import com.dawne.com2usbaseball.domain.fun.mileage.entity.MileageSniperTargetEntity;
import com.dawne.com2usbaseball.domain.fun.mileage.repository.MileageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 조회 전용. 캐시를 비우는 경로가 없어 화면에서 수정되지 않는 데이터다 —
 * 운영자가 DB(선수 카드/레전드 재료)를 직접 고치면 서버를 재시작해야 반영된다.
 */
@Service
@RequiredArgsConstructor
public class MileageServiceImpl implements MileageService {

    private final MileageRepository mileageRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "mileageSniperTarget", key = "'public'")
    public MileageSnapshot<MileageSniperTargetResponse> getSniperTargets() {
        List<MileageSniperTargetResponse> items = mileageRepository.findSniperTargets()
                .stream()
                .map(MileageServiceImpl::toResponse)
                .toList();
        return MileageSnapshot.of(items);
    }

    private static MileageSniperTargetResponse toResponse(MileageSniperTargetEntity e) {
        return new MileageSniperTargetResponse(
                e.getCardId(), e.getTeamCode(), e.getSeasonYear(),
                e.getPositionCode(), e.getSubPositionCode(),
                Integer.valueOf(1).equals(e.getMainUnique()),
                Integer.valueOf(1).equals(e.getSubUnique()),
                e.getPlayerName(), e.getLegendName()
        );
    }
}
