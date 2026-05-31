package com.dawne.com2usbaseball.domain.wiki.service;

import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiGameInfoResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiPitchGradeResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiPitchResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiStatInfluenceResponse;
import com.dawne.com2usbaseball.domain.wiki.entity.WikiPitchEntity;
import com.dawne.com2usbaseball.domain.wiki.entity.WikiPitchGradeEntity;
import com.dawne.com2usbaseball.domain.wiki.entity.WikiStatInfluenceEntity;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;
import com.dawne.com2usbaseball.domain.wiki.repository.WikiGameInfoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WikiGameInfoServiceImpl implements WikiGameInfoService {

    private final WikiGameInfoMapper mapper;

    @Override
    @Cacheable(value = "wikiGameInfoByTarget", key = "#target")
    public WikiGameInfoResponse getGameInfo(WikiTarget target) {
        List<WikiPitchEntity> pitchEntities = mapper.selectActivePitches();
        List<WikiPitchGradeEntity> gradeEntities = mapper.selectActivePitchGrades();
        List<WikiStatInfluenceEntity> statEntities = mapper.selectActiveStatInfluences(target);

        // pitch_code 기준으로 등급 그룹핑
        Map<String, List<WikiPitchGradeEntity>> gradeMap = gradeEntities.stream()
                .collect(Collectors.groupingBy(WikiPitchGradeEntity::getPitchCode));

        List<WikiPitchResponse> pitches = pitchEntities.stream()
                .map(p -> new WikiPitchResponse(
                        p.getId(), p.getCode(), p.getName(), p.getPitchType(), p.getDescription(), p.getDisplayOrder(),
                        gradeMap.getOrDefault(p.getCode(), List.of()).stream()
                                .map(g -> new WikiPitchGradeResponse(
                                        g.getId(), g.getPitchCode(), g.getGrade(),
                                        g.getVelocityMin(), g.getVelocityMax(), g.getBreakAmount(), g.getDescription()
                                )).toList()
                )).toList();

        List<WikiStatInfluenceResponse> stats = statEntities.stream()
                .map(s -> new WikiStatInfluenceResponse(
                        s.getId(), s.getTarget(), s.getStatCode(), s.getInfluenceType(),
                        s.getInfluenceTarget(), s.getWeight(), s.getDescription(), s.getDisplayOrder()
                )).toList();

        return new WikiGameInfoResponse(target, pitches, stats);
    }
}
