package com.dawne.com2usbaseball.domain.skill.service;

import com.dawne.com2usbaseball.domain.skill.dto.response.SkillItemResponse;
import com.dawne.com2usbaseball.domain.skill.dto.response.SkillSetResponse;
import com.dawne.com2usbaseball.domain.skill.service.support.SkillGradeGrouper;
import com.dawne.com2usbaseball.domain.skill.service.support.SkillItemConvertor;
import com.dawne.com2usbaseball.domain.player.entity.PlayerSkillsEntity;
import com.dawne.com2usbaseball.common.enums.Grade;
import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.skill.repository.PlayerSkillsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class PlayerSkillsServiceImpl implements PlayerSkillsService {

    private final PlayerSkillsRepository repository;
    private final SkillItemConvertor skillItemConvertor;
    private final SkillGradeGrouper gradeGrouper;


    @Override
    @Cacheable(value = "playerSkillSetByTarget", key = "#target")
    public SkillSetResponse getPlayerSkillSet(Target target) {
        /* 투수/타자에 따라 전체 스킬을 조회하는 function */
        List<PlayerSkillsEntity> entities = repository.findAllSkillSetByTarget(target);

        // Entity → Response Item 변환
        List<SkillItemResponse> items = skillItemConvertor.toItems(entities);

        // Grade 기준으로 grouping (EnumMap 사용 → 성능/안정성)
        Map<Grade, List<SkillItemResponse>> grouped = gradeGrouper.gradeListMap(items);

        return new SkillSetResponse(
                grouped.getOrDefault(Grade.LEGEND, List.of()),
                grouped.getOrDefault(Grade.PLATINUM, List.of()),
                grouped.getOrDefault(Grade.HERO, List.of()),
                grouped.getOrDefault(Grade.NORMAL, List.of())
        );
    }


}
