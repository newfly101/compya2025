package com.dawne.com2usbaseball.domain.wiki.service.admin;

import com.dawne.com2usbaseball.domain.wiki.dto.request.WikiPitchGradeRequest;
import com.dawne.com2usbaseball.domain.wiki.dto.request.WikiPitchRequest;
import com.dawne.com2usbaseball.domain.wiki.dto.request.WikiStatInfluenceRequest;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiGameInfoResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiPitchGradeResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiPitchResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiStatInfluenceResponse;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;

import java.util.List;

public interface AdminWikiService {

    // Pitch
    List<WikiPitchResponse> getAllPitches();
    WikiPitchResponse createPitch(WikiPitchRequest request);
    WikiPitchResponse updatePitch(Long id, WikiPitchRequest request);
    void deletePitch(Long id);

    // PitchGrade
    List<WikiPitchGradeResponse> getAllPitchGrades();
    WikiPitchGradeResponse createPitchGrade(WikiPitchGradeRequest request);
    WikiPitchGradeResponse updatePitchGrade(Long id, WikiPitchGradeRequest request);
    void deletePitchGrade(Long id);

    // StatInfluence
    List<WikiStatInfluenceResponse> getAllStatInfluences(WikiTarget target);
    WikiStatInfluenceResponse createStatInfluence(WikiStatInfluenceRequest request);
    WikiStatInfluenceResponse updateStatInfluence(Long id, WikiStatInfluenceRequest request);
    void deleteStatInfluence(Long id);
}
