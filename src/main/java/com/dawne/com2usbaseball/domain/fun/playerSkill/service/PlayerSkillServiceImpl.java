package com.dawne.com2usbaseball.domain.fun.playerSkill.service;

import com.dawne.com2usbaseball.domain.fun.playerSkill.dto.PlayerSkillSnapshot;
import com.dawne.com2usbaseball.domain.fun.playerSkill.dto.response.PlayerSkillResponse;
import com.dawne.com2usbaseball.domain.fun.playerSkill.dto.response.PlayerSkillTierResponse;
import com.dawne.com2usbaseball.domain.fun.playerSkill.entity.PlayerSkillEntity;
import com.dawne.com2usbaseball.domain.fun.playerSkill.entity.PlayerSkillTierEntity;
import com.dawne.com2usbaseball.domain.fun.playerSkill.entity.PlayerSkillTierValueEntity;
import com.dawne.com2usbaseball.domain.fun.playerSkill.repository.PlayerSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

/**
 * 조회 전용. 등록·수정·삭제는 다루지 않는다.
 * 캐시를 비우는 경로가 없어 SQL 로 값을 고쳤으면 서버를 재시작해야 한다
 * (운영 중 갱신이 필요해지면 @CacheEvict 관리자 엔드포인트를 추가하면 된다).
 */
@Service
@RequiredArgsConstructor
public class PlayerSkillServiceImpl implements PlayerSkillService {

    private final PlayerSkillRepository playerSkillRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "playerSkill", key = "'hitter'")
    public PlayerSkillSnapshot<PlayerSkillResponse> getHitterSkills() {
        return toSnapshot(playerSkillRepository.findHitterSkills());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "playerSkill", key = "'pitcher'")
    public PlayerSkillSnapshot<PlayerSkillResponse> getPitcherSkills() {
        return toSnapshot(playerSkillRepository.findPitcherSkills());
    }

    private static PlayerSkillSnapshot<PlayerSkillResponse> toSnapshot(List<PlayerSkillEntity> entities) {
        List<PlayerSkillResponse> items = entities.stream()
                .map(PlayerSkillServiceImpl::toResponse)
                .toList();
        return PlayerSkillSnapshot.of(items);
    }

    private static PlayerSkillResponse toResponse(PlayerSkillEntity e) {
        List<PlayerSkillTierResponse> tiers = e.getTiers().stream()
                .map(PlayerSkillServiceImpl::toTierResponse)
                .toList();

        return new PlayerSkillResponse(
                e.getId(), e.getPlayerRole(), e.getSkillGrade(), e.getSkillName(), e.getMaxTier(),
                e.getSortOrder(), e.getDescriptionTemplate(), e.getValueCount(), e.getValueGroups(),
                tiers
        );
    }

    private static PlayerSkillTierResponse toTierResponse(PlayerSkillTierEntity t) {
        // API 응답 계약은 그대로 List<Integer> — 래퍼 엔티티는 여기서만 평탄화한다.
        List<Integer> values = t.getValues().stream()
                .sorted(Comparator.comparing(PlayerSkillTierValueEntity::getValueOrder))
                .map(PlayerSkillTierValueEntity::getSkillValue)
                .toList();
        return new PlayerSkillTierResponse(t.getTier(), t.getRawValue(), t.isEstimated(), values);
    }
}
