package com.dawne.com2usbaseball.domain.wiki.service.admin;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.wiki.dto.request.WikiPitchGradeRequest;
import com.dawne.com2usbaseball.domain.wiki.dto.request.WikiPitchRequest;
import com.dawne.com2usbaseball.domain.wiki.dto.request.WikiStatInfluenceRequest;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiPitchGradeResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiPitchResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiStatInfluenceResponse;
import com.dawne.com2usbaseball.domain.wiki.entity.WikiPitchEntity;
import com.dawne.com2usbaseball.domain.wiki.entity.WikiPitchGradeEntity;
import com.dawne.com2usbaseball.domain.wiki.entity.WikiStatInfluenceEntity;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiMessages;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;
import com.dawne.com2usbaseball.domain.wiki.repository.WikiGameInfoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminWikiServiceImpl implements AdminWikiService {

    private final WikiGameInfoMapper mapper;

    // ---- Pitch ----

    @Override
    public List<WikiPitchResponse> getAllPitches() {
        List<WikiPitchEntity> pitches = mapper.selectAllPitches();
        List<com.dawne.com2usbaseball.domain.wiki.entity.WikiPitchGradeEntity> grades = mapper.selectAllPitchGrades();
        Map<String, List<WikiPitchGradeEntity>> gradeMap = grades.stream()
                .collect(Collectors.groupingBy(WikiPitchGradeEntity::getPitchCode));
        return pitches.stream().map(p -> toWikiPitchResponse(p, gradeMap)).toList();
    }

    @Override
    @Transactional
    @CacheEvict(value = "wikiGameInfoByTarget", allEntries = true)
    public WikiPitchResponse createPitch(WikiPitchRequest request) {
        WikiPitchEntity entity = WikiPitchEntity.builder()
                .code(request.code())
                .name(request.name())
                .pitchType(request.pitchType())
                .description(request.description())
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .build();
        try {
            mapper.insertPitch(entity);
        } catch (DataIntegrityViolationException e) {
            throw new BaseException(WikiMessages.WIKI_DUPLICATE_CODE, HttpStatus.CONFLICT);
        }
        WikiPitchEntity saved = mapper.selectPitchById(entity.getId())
                .orElseThrow(() -> new BaseException(WikiMessages.WIKI_PITCH_NOT_FOUND, HttpStatus.NOT_FOUND));
        return toWikiPitchResponse(saved, Map.of());
    }

    @Override
    @Transactional
    @CacheEvict(value = "wikiGameInfoByTarget", allEntries = true)
    public WikiPitchResponse updatePitch(Long id, WikiPitchRequest request) {
        WikiPitchEntity entity = mapper.selectPitchById(id)
                .orElseThrow(() -> new BaseException(WikiMessages.WIKI_PITCH_NOT_FOUND, HttpStatus.NOT_FOUND));
        entity.setName(request.name());
        entity.setPitchType(request.pitchType());
        entity.setDescription(request.description());
        if (request.displayOrder() != null) entity.setDisplayOrder(request.displayOrder());
        mapper.updatePitch(entity);
        return toWikiPitchResponse(entity, Map.of());
    }

    @Override
    @Transactional
    @CacheEvict(value = "wikiGameInfoByTarget", allEntries = true)
    public void deletePitch(Long id) {
        WikiPitchEntity entity = mapper.selectPitchById(id)
                .orElseThrow(() -> new BaseException(WikiMessages.WIKI_PITCH_NOT_FOUND, HttpStatus.NOT_FOUND));
        mapper.softDeletePitchGradeByCode(entity.getCode());
        mapper.softDeletePitch(id);
    }

    // ---- PitchGrade ----

    @Override
    public List<WikiPitchGradeResponse> getAllPitchGrades() {
        return mapper.selectAllPitchGrades().stream().map(this::toGradeResponse).toList();
    }

    @Override
    @Transactional
    @CacheEvict(value = "wikiGameInfoByTarget", allEntries = true)
    public WikiPitchGradeResponse createPitchGrade(WikiPitchGradeRequest request) {
        WikiPitchGradeEntity entity = WikiPitchGradeEntity.builder()
                .pitchCode(request.pitchCode())
                .grade(request.grade())
                .velocityMin(request.velocityMin())
                .velocityMax(request.velocityMax())
                .breakAmount(request.breakAmount())
                .description(request.description())
                .build();
        try {
            mapper.insertPitchGrade(entity);
        } catch (DataIntegrityViolationException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("fk_wiki_pitch_grade_code")) {
                throw new BaseException(WikiMessages.WIKI_INVALID_PITCH_CODE, HttpStatus.BAD_REQUEST);
            }
            throw new BaseException(WikiMessages.WIKI_DUPLICATE_CODE, HttpStatus.CONFLICT);
        }
        WikiPitchGradeEntity saved = mapper.selectPitchGradeById(entity.getId())
                .orElseThrow(() -> new BaseException(WikiMessages.WIKI_PITCH_GRADE_NOT_FOUND, HttpStatus.NOT_FOUND));
        return toGradeResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "wikiGameInfoByTarget", allEntries = true)
    public WikiPitchGradeResponse updatePitchGrade(Long id, WikiPitchGradeRequest request) {
        WikiPitchGradeEntity entity = mapper.selectPitchGradeById(id)
                .orElseThrow(() -> new BaseException(WikiMessages.WIKI_PITCH_GRADE_NOT_FOUND, HttpStatus.NOT_FOUND));
        entity.setVelocityMin(request.velocityMin());
        entity.setVelocityMax(request.velocityMax());
        entity.setBreakAmount(request.breakAmount());
        entity.setDescription(request.description());
        mapper.updatePitchGrade(entity);
        return toGradeResponse(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "wikiGameInfoByTarget", allEntries = true)
    public void deletePitchGrade(Long id) {
        mapper.selectPitchGradeById(id)
                .orElseThrow(() -> new BaseException(WikiMessages.WIKI_PITCH_GRADE_NOT_FOUND, HttpStatus.NOT_FOUND));
        mapper.deletePitchGrade(id);
    }

    // ---- StatInfluence ----

    @Override
    public List<WikiStatInfluenceResponse> getAllStatInfluences(WikiTarget target) {
        return mapper.selectAllStatInfluences(target).stream().map(this::toStatResponse).toList();
    }

    @Override
    @Transactional
    @CacheEvict(value = "wikiGameInfoByTarget", allEntries = true)
    public WikiStatInfluenceResponse createStatInfluence(WikiStatInfluenceRequest request) {
        WikiStatInfluenceEntity entity = WikiStatInfluenceEntity.builder()
                .target(request.target())
                .statCode(request.statCode())
                .influenceType(request.influenceType())
                .influenceTarget(request.influenceTarget())
                .weight(request.weight() != null ? request.weight() : 1)
                .description(request.description())
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .build();
        mapper.insertStatInfluence(entity);
        WikiStatInfluenceEntity saved = mapper.selectStatInfluenceById(entity.getId())
                .orElseThrow(() -> new BaseException(WikiMessages.WIKI_STAT_INFLUENCE_NOT_FOUND, HttpStatus.NOT_FOUND));
        return toStatResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "wikiGameInfoByTarget", allEntries = true)
    public WikiStatInfluenceResponse updateStatInfluence(Long id, WikiStatInfluenceRequest request) {
        WikiStatInfluenceEntity entity = mapper.selectStatInfluenceById(id)
                .orElseThrow(() -> new BaseException(WikiMessages.WIKI_STAT_INFLUENCE_NOT_FOUND, HttpStatus.NOT_FOUND));
        entity.setStatCode(request.statCode());
        entity.setInfluenceType(request.influenceType());
        entity.setInfluenceTarget(request.influenceTarget());
        if (request.weight() != null) entity.setWeight(request.weight());
        entity.setDescription(request.description());
        if (request.displayOrder() != null) entity.setDisplayOrder(request.displayOrder());
        mapper.updateStatInfluence(entity);
        return toStatResponse(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "wikiGameInfoByTarget", allEntries = true)
    public void deleteStatInfluence(Long id) {
        mapper.selectStatInfluenceById(id)
                .orElseThrow(() -> new BaseException(WikiMessages.WIKI_STAT_INFLUENCE_NOT_FOUND, HttpStatus.NOT_FOUND));
        mapper.softDeleteStatInfluence(id);
    }

    // ---- 내부 변환 메서드 ----

    private WikiPitchResponse toWikiPitchResponse(WikiPitchEntity p, Map<String, List<WikiPitchGradeEntity>> gradeMap) {
        List<WikiPitchGradeResponse> grades = gradeMap.getOrDefault(p.getCode(), List.of())
                .stream().map(this::toGradeResponse).toList();
        return new WikiPitchResponse(p.getId(), p.getCode(), p.getName(), p.getPitchType(), p.getDescription(), p.getDisplayOrder(), grades);
    }

    private WikiPitchGradeResponse toGradeResponse(WikiPitchGradeEntity g) {
        return new WikiPitchGradeResponse(g.getId(), g.getPitchCode(), g.getGrade(),
                g.getVelocityMin(), g.getVelocityMax(), g.getBreakAmount(), g.getDescription());
    }

    private WikiStatInfluenceResponse toStatResponse(WikiStatInfluenceEntity s) {
        return new WikiStatInfluenceResponse(s.getId(), s.getTarget(), s.getStatCode(), s.getInfluenceType(),
                s.getInfluenceTarget(), s.getWeight(), s.getDescription(), s.getDisplayOrder());
    }
}
