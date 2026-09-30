package com.dawne.com2usbaseball.domain.event.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.event.dto.response.EventResponse;
import com.dawne.com2usbaseball.domain.event.enums.EventMessages;
import com.dawne.com2usbaseball.domain.event.service.CafeSyncService;
import com.dawne.com2usbaseball.domain.event.service.support.CafeSyncResult;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 공식 카페 자동 수집 — 관리자 전용 (`/api/admin/**` + 클래스 레벨 ADMIN 이중 방어) */
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/cafe-sync")
public class AdminCafeSyncController {

    private final CafeSyncService cafeSyncService;

    // 지금 수집 — 이미 실행 중이면 409
    @PostMapping
    public GlobalResponse<CafeSyncResult> syncNow() {
        return GlobalResponse.success(EventMessages.EVENT_CAFE_SYNC_DONE, cafeSyncService.syncNow());
    }

    // 수집 이벤트 본문 갱신 (원문 변경 반영)
    @PostMapping("/events/{id}/refresh")
    public GlobalResponse<EventResponse> refresh(@PathVariable Long id) {
        return GlobalResponse.success(EventMessages.EVENT_CAFE_REFRESHED, cafeSyncService.refreshEvent(id));
    }
}
