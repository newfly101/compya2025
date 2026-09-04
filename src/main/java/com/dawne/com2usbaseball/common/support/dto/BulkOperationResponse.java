package com.dawne.com2usbaseball.common.support.dto;

import java.util.List;

/**
 * 일괄 작업(삭제/노출변경) 처리 결과 공통 응답.
 * 요청받은 id 중 실제로 존재해 처리된 id는 successIds, 존재하지 않아 처리되지 않은 id는 failedIds에 담는다.
 * 부분 실패를 허용한다 — 존재하는 id만 처리하고 전체 롤백하지 않는다.
 */
public record BulkOperationResponse(
        List<Long> successIds,
        List<Long> failedIds
) {
    public static BulkOperationResponse of(List<Long> successIds, List<Long> failedIds) {
        return new BulkOperationResponse(successIds, failedIds);
    }

    public static BulkOperationResponse empty() {
        return new BulkOperationResponse(List.of(), List.of());
    }
}
