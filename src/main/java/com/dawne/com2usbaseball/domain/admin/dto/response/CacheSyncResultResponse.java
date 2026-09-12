package com.dawne.com2usbaseball.domain.admin.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 동기화 실행 결과 1건. 오래 걸리는 작업일수록 elapsedMs를 화면에 보여줘야
 * 사용자가 "멈춘 게 아니라 끝났다"를 알 수 있다.
 */
public record CacheSyncResultResponse(
        String id,
        String label,
        boolean success,
        long elapsedMs,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm") LocalDateTime syncedAt,
        // 실패했을 때만 채운다. 성공이면 null
        String errorMessage
) {
}
