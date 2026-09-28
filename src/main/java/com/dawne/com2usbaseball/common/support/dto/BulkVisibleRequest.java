package com.dawne.com2usbaseball.common.support.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * 일괄 노출 여부 변경 요청 공통 DTO.
 * visible 은 생략하면 조용히 false 로 처리되어 전체가 숨겨지므로 필수로 둔다.
 * ids 는 null/빈 배열이어도 각 도메인 서비스가 빈 결과를 반환한다 — 제약을 걸지 않는다.
 */
public record BulkVisibleRequest(
        List<Long> ids,
        @NotNull Boolean visible
) {
}
