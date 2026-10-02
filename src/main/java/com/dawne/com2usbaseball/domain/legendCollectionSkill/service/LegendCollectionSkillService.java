package com.dawne.com2usbaseball.domain.legendCollectionSkill.service;

import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.BatchEventRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.SaveSkillsRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.SkillEventRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.response.LegendSkillResponse;

import java.util.Collection;
import java.util.List;

public interface LegendCollectionSkillService {

    List<LegendSkillResponse> getMySkills(Long userId);

    LegendSkillResponse saveSkills(Long userId, String legendId, SaveSkillsRequest request);

    LegendSkillResponse applyEvent(Long userId, String legendId, SkillEventRequest request);

    /** 강화 여러 건을 한 트랜잭션에서 순서대로 적용. 하나라도 위반이면 전체 롤백. */
    LegendSkillResponse applyBatch(Long userId, String legendId, BatchEventRequest request);

    /** 보유 해제된 레전드의 스킬 행 삭제. 로그는 남긴다 (REQ-LCSK-17). */
    void deleteByLegends(Long userId, Collection<String> legendIds);
}
