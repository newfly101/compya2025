package com.dawne.com2usbaseball.domain.fun.legendStat.service;

import com.dawne.com2usbaseball.common.enums.fun.PlayerRole;
import com.dawne.com2usbaseball.domain.fun.legendStat.dto.LegendStatSnapshot;
import com.dawne.com2usbaseball.domain.fun.legendStat.dto.response.FunLegendPitchResponse;
import com.dawne.com2usbaseball.domain.fun.legendStat.dto.response.FunLegendStatResponse;
import com.dawne.com2usbaseball.domain.fun.legendStat.dto.response.FunPitchTypeResponse;
import com.dawne.com2usbaseball.domain.fun.legendStat.entity.LegendStatEntity;
import com.dawne.com2usbaseball.domain.fun.legendStat.repository.FunLegendStatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * 조회 전용. TTL 없는 메모리 캐시(spring.cache.type=simple)라 SQL 로 값을 고쳐도
 * 자동으로는 반영되지 않는다 — 서버 재시작이 아니라, 어드민 화면의 캐시 동기화
 * (CacheSyncServiceImpl 가 legendStat·legendPitchType 을 함께 비우고 다시 채움)를
 * 눌러야 반영된다.
 */
@Service
@RequiredArgsConstructor
public class FunLegendStatServiceImpl implements FunLegendStatService {

    private final FunLegendStatRepository funLegendStatRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "legendStat", key = "'public'")
    public LegendStatSnapshot<FunLegendStatResponse> getAll() {
        List<FunLegendStatResponse> items = funLegendStatRepository.findAllWithPitches()
                .stream()
                .map(FunLegendStatServiceImpl::toResponse)
                .toList();
        return LegendStatSnapshot.of(items);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "legendPitchType", key = "'public'")
    public LegendStatSnapshot<FunPitchTypeResponse> getPitchTypes() {
        List<FunPitchTypeResponse> items = funLegendStatRepository.findAllPitchTypes()
                .stream()
                .map(t -> new FunPitchTypeResponse(t.getPitchCode(), t.getPitchName(),
                        t.getStatGroup(), t.getSortNo()))
                .toList();
        return LegendStatSnapshot.of(items);
    }

    private static FunLegendStatResponse toResponse(LegendStatEntity e) {
        // 타자는 구종 개념이 없다. null 로 두어 응답에서 아예 빠지게 한다
        List<FunLegendPitchResponse> pitches =
                e.getPlayerRole() == PlayerRole.PITCHER && e.getPitches() != null && !e.getPitches().isEmpty()
                        ? e.getPitches().stream()
                        .map(p -> new FunLegendPitchResponse(p.getPitchCode(), p.getPitchGrade()))
                        .toList()
                        : null;

        return new FunLegendStatResponse(
                e.getId(), e.getLegendName(), e.getLegendType(), e.getTeamCode(), e.getPlayerRole(),
                splitPositions(e.getPositionCode()), e.getRating(), e.getRatingRev(),
                List.of(e.getStat1(), e.getStat2(), e.getStat3(), e.getStat4(), e.getStat5()),
                pitches
        );
    }

    /** position_code "SS/CF" → ["SS","CF"]. 화면 포지션 필터가 포함 여부로 동작한다. */
    private static List<String> splitPositions(String positionCode) {
        if (positionCode == null || positionCode.isBlank()) return List.of();
        return Arrays.stream(positionCode.split("/"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
