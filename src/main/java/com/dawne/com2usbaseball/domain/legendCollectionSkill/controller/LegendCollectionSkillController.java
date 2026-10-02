package com.dawne.com2usbaseball.domain.legendCollectionSkill.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.BatchEventRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.SaveSkillsRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.SkillEventRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.service.LegendCollectionSkillService;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.LegendCollectionSkillMessages.*;

/** 레전드 스킬 등록·강화 — 전부 로그인 필요. 본인 기록만 읽고 쓴다. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/legend-collection-skills")
public class LegendCollectionSkillController {

    private final LegendCollectionSkillService service;

    @GetMapping
    public ResponseEntity<GlobalResponse<?>> get(HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(
                LEGEND_COLLECTION_SKILL_GET_SUCCESS, service.getMySkills(requireUserId(http))));
    }

    @PutMapping("/{legendId}")
    public ResponseEntity<GlobalResponse<?>> save(@PathVariable String legendId,
                                                  @Valid @RequestBody SaveSkillsRequest request,
                                                  HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(
                LEGEND_COLLECTION_SKILL_SAVE_SUCCESS, service.saveSkills(requireUserId(http), legendId, request)));
    }

    @PostMapping("/{legendId}/events")
    public ResponseEntity<GlobalResponse<?>> event(@PathVariable String legendId,
                                                   @Valid @RequestBody SkillEventRequest request,
                                                   HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(
                LEGEND_COLLECTION_SKILL_EVENT_SUCCESS, service.applyEvent(requireUserId(http), legendId, request)));
    }

    @PostMapping("/{legendId}/events/batch")
    public ResponseEntity<GlobalResponse<?>> batch(@PathVariable String legendId,
                                                   @Valid @RequestBody BatchEventRequest request,
                                                   HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(
                LEGEND_COLLECTION_SKILL_EVENT_SUCCESS, service.applyBatch(requireUserId(http), legendId, request)));
    }

    private Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }
}
