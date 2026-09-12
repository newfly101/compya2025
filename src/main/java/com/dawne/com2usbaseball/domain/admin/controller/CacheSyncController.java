package com.dawne.com2usbaseball.domain.admin.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.admin.dto.response.CacheSyncResultResponse;
import com.dawne.com2usbaseball.domain.admin.dto.response.CacheSyncTargetResponse;
import com.dawne.com2usbaseball.domain.admin.enums.CacheSyncMessages;
import com.dawne.com2usbaseball.domain.admin.service.CacheSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 어드민이 SQL로 DB를 직접 고친 뒤, 서버 재시작 없이 컨텐츠 캐시만 골라 비우고 다시 채우는 화면용 API.
 * /api/admin/** 경로라 보안 설정에서 관리자 권한만 통과하도록 이미 막혀 있다.
 */
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/cache-sync")
public class CacheSyncController {

    private final CacheSyncService cacheSyncService;

    @GetMapping("/targets")
    public GlobalResponse<List<CacheSyncTargetResponse>> getTargets() {
        List<CacheSyncTargetResponse> targets = cacheSyncService.getTargets();
        return GlobalResponse.success(CacheSyncMessages.CACHE_SYNC_TARGETS_SUCCESS, targets);
    }

    @PostMapping("/{targetId}/sync")
    public GlobalResponse<CacheSyncResultResponse> sync(@PathVariable String targetId) {
        CacheSyncResultResponse result = cacheSyncService.sync(targetId);
        return GlobalResponse.success(CacheSyncMessages.CACHE_SYNC_SUCCESS, result);
    }

    @PostMapping("/sync-all")
    public GlobalResponse<List<CacheSyncResultResponse>> syncAll() {
        List<CacheSyncResultResponse> results = cacheSyncService.syncAll();
        return GlobalResponse.success(CacheSyncMessages.CACHE_SYNC_ALL_SUCCESS, results);
    }
}
