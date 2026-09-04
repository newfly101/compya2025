package com.dawne.com2usbaseball.common.support.dto;

import java.util.List;

/**
 * 일괄 작업(삭제 등) 요청 공통 DTO. ids가 null/빈 배열이어도 서버는 죽지 않고
 * 빈 결과({@link BulkOperationResponse})를 반환한다 — 각 도메인 서비스에서 처리.
 */
public record BulkIdsRequest(
        List<Long> ids
) {
}
