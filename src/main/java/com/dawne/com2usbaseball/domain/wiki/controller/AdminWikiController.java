package com.dawne.com2usbaseball.domain.wiki.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.request.WikiPitchGradeRequest;
import com.dawne.com2usbaseball.domain.wiki.dto.request.WikiPitchRequest;
import com.dawne.com2usbaseball.domain.wiki.dto.request.WikiStatInfluenceRequest;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiPitchGradeResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiPitchResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiStatInfluenceResponse;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiMessages;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;
import com.dawne.com2usbaseball.domain.wiki.service.admin.AdminWikiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/wiki")
public class AdminWikiController {

    private final AdminWikiService adminWikiService;

    // ---- Pitch ----

    @GetMapping("/pitches")
    public GlobalResponse<List<WikiPitchResponse>> getAllPitches() {
        return GlobalResponse.success(WikiMessages.WIKI_GAME_INFO_SUCCESS, adminWikiService.getAllPitches());
    }

    @PostMapping("/pitches")
    public GlobalResponse<WikiPitchResponse> createPitch(@Valid @RequestBody WikiPitchRequest request) {
        return GlobalResponse.success(WikiMessages.WIKI_PITCH_CREATED, adminWikiService.createPitch(request));
    }

    @PutMapping("/pitches/{id}")
    public GlobalResponse<WikiPitchResponse> updatePitch(@PathVariable Long id, @Valid @RequestBody WikiPitchRequest request) {
        return GlobalResponse.success(WikiMessages.WIKI_PITCH_UPDATED, adminWikiService.updatePitch(id, request));
    }

    @DeleteMapping("/pitches/{id}")
    public GlobalResponse<Void> deletePitch(@PathVariable Long id) {
        adminWikiService.deletePitch(id);
        return GlobalResponse.success(WikiMessages.WIKI_PITCH_DELETED, null);
    }

    // ---- PitchGrade ----

    @GetMapping("/pitch-grades")
    public GlobalResponse<List<WikiPitchGradeResponse>> getAllPitchGrades() {
        return GlobalResponse.success(WikiMessages.WIKI_GAME_INFO_SUCCESS, adminWikiService.getAllPitchGrades());
    }

    @PostMapping("/pitch-grades")
    public GlobalResponse<WikiPitchGradeResponse> createPitchGrade(@Valid @RequestBody WikiPitchGradeRequest request) {
        return GlobalResponse.success(WikiMessages.WIKI_PITCH_GRADE_CREATED, adminWikiService.createPitchGrade(request));
    }

    @PutMapping("/pitch-grades/{id}")
    public GlobalResponse<WikiPitchGradeResponse> updatePitchGrade(@PathVariable Long id, @Valid @RequestBody WikiPitchGradeRequest request) {
        return GlobalResponse.success(WikiMessages.WIKI_PITCH_GRADE_UPDATED, adminWikiService.updatePitchGrade(id, request));
    }

    @DeleteMapping("/pitch-grades/{id}")
    public GlobalResponse<Void> deletePitchGrade(@PathVariable Long id) {
        adminWikiService.deletePitchGrade(id);
        return GlobalResponse.success(WikiMessages.WIKI_PITCH_GRADE_DELETED, null);
    }

    // ---- StatInfluence ----

    @GetMapping("/stat-influences")
    public GlobalResponse<List<WikiStatInfluenceResponse>> getAllStatInfluences(
            @RequestParam(required = false) WikiTarget target
    ) {
        return GlobalResponse.success(WikiMessages.WIKI_GAME_INFO_SUCCESS, adminWikiService.getAllStatInfluences(target));
    }

    @PostMapping("/stat-influences")
    public GlobalResponse<WikiStatInfluenceResponse> createStatInfluence(@Valid @RequestBody WikiStatInfluenceRequest request) {
        return GlobalResponse.success(WikiMessages.WIKI_STAT_INFLUENCE_CREATED, adminWikiService.createStatInfluence(request));
    }

    @PutMapping("/stat-influences/{id}")
    public GlobalResponse<WikiStatInfluenceResponse> updateStatInfluence(@PathVariable Long id, @Valid @RequestBody WikiStatInfluenceRequest request) {
        return GlobalResponse.success(WikiMessages.WIKI_STAT_INFLUENCE_UPDATED, adminWikiService.updateStatInfluence(id, request));
    }

    @DeleteMapping("/stat-influences/{id}")
    public GlobalResponse<Void> deleteStatInfluence(@PathVariable Long id) {
        adminWikiService.deleteStatInfluence(id);
        return GlobalResponse.success(WikiMessages.WIKI_STAT_INFLUENCE_DELETED, null);
    }
}
