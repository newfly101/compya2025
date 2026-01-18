package com.dawne.com2usbaseball.service.skills;

import com.dawne.com2usbaseball.dto.response.skills.SkillItemResponse;
import com.dawne.com2usbaseball.dto.response.skills.SkillSetResponse;
import com.dawne.com2usbaseball.entity.PlayerSkillsEntity;
import com.dawne.com2usbaseball.enums.Grade;
import com.dawne.com2usbaseball.enums.Target;
import com.dawne.com2usbaseball.repository.PlayerSkillsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayerSkillsServiceImpl implements PlayerSkillsService {

    private final PlayerSkillsRepository repository;

    @Override
    public SkillSetResponse getSkillSetByTarget(Target target) {
        List<PlayerSkillsEntity> entities = repository.findByTarget(target);

        // Grade 기준으로 grouping (EnumMap 사용 → 성능/안정성)
        Map<Grade, List<SkillItemResponse>> grouped =
                entities.stream()
                        .map(this::toItem)
                        .collect(Collectors.groupingBy(
                                SkillItemResponse::grade,
                                () -> new EnumMap<>(Grade.class),
                                Collectors.toList()
                        ));

        return new SkillSetResponse(
                grouped.getOrDefault(Grade.LEGEND, List.of()),
                grouped.getOrDefault(Grade.PLATINUM, List.of()),
                grouped.getOrDefault(Grade.HERO, List.of()),
                grouped.getOrDefault(Grade.NORMAL, List.of())
        );
    }

    // Entity → Response 변환 (Service 책임)
    private SkillItemResponse toItem(PlayerSkillsEntity entity) {
        return new SkillItemResponse(
                entity.getId(),
                entity.getName(),
                entity.getGrade(),
                entity.getTarget()
        );
    }
}
