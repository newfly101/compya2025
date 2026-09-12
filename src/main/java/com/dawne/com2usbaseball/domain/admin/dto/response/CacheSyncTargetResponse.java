package com.dawne.com2usbaseball.domain.admin.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 동기화 가능한 캐시 대상 1건. FE는 이 목록을 그대로 화면에 그린다(하드코딩 금지) —
 * 새 캐시가 추가되면 이 응답에만 항목을 늘리면 된다.
 */
public record CacheSyncTargetResponse(
        String id,
        String label,
        String description,
        // 데이터가 많아 다시 채우는 데 다른 항목보다 시간이 걸릴 수 있다는 힌트 (playerCard 등)
        boolean heavy,
        // 서버 메모리에만 있는 값 — 재시작하면 사라진다(운영 서버 한 대 기준으로는 충분한 참고용 정보)
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime lastSyncedAt
) {
}
