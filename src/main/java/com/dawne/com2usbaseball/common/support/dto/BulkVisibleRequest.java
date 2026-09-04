package com.dawne.com2usbaseball.common.support.dto;

import java.util.List;

/**
 * 일괄 노출 여부 변경 요청 공통 DTO.
 */
public record BulkVisibleRequest(
        List<Long> ids,
        Boolean visible
) {
}
