package com.dawne.com2usbaseball.domain.legendCollection.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SaveChangesRequest;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SavePreferencesRequest;
import com.dawne.com2usbaseball.domain.legendCollection.enums.LegendCollectionMessages;
import com.dawne.com2usbaseball.domain.legendCollection.service.LegendCollectionService;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** 레전드 재료 보유 현황 — 전부 로그인 필요. 서버는 로그인한 본인 기록만 읽고 쓴다. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/legend-collections")
public class LegendCollectionController {

    private final LegendCollectionService legendCollectionService;

    @GetMapping
    public ResponseEntity<GlobalResponse<?>> get(HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(
                LegendCollectionMessages.LEGEND_COLLECTION_GET_SUCCESS,
                legendCollectionService.getMyCollection(requireUserId(http))));
    }

    @PutMapping("/changes")
    public ResponseEntity<GlobalResponse<?>> saveChanges(@Valid @RequestBody SaveChangesRequest request,
                                                         HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(
                LegendCollectionMessages.LEGEND_COLLECTION_CHANGES_SAVE_SUCCESS,
                legendCollectionService.saveChanges(requireUserId(http), request)));
    }

    @PutMapping("/preferences")
    public ResponseEntity<GlobalResponse<?>> savePreferences(@Valid @RequestBody SavePreferencesRequest request,
                                                             HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(
                LegendCollectionMessages.LEGEND_COLLECTION_PREFERENCES_SAVE_SUCCESS,
                legendCollectionService.savePreferences(requireUserId(http), request)));
    }

    @GetMapping("/schedule")
    public ResponseEntity<GlobalResponse<?>> schedule(HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(
                LegendCollectionMessages.LEGEND_COLLECTION_SCHEDULE_SUCCESS,
                legendCollectionService.getSchedule(requireUserId(http))));
    }

    private Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }
}
