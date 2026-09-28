package com.dawne.com2usbaseball.domain.statistics.dto.request;

import jakarta.validation.constraints.Size;

/**
 * target 생략 시 서비스에서 "kakaopay" 로 기본 처리한다(현재 후원 수단이 카카오페이뿐).
 * 상한 20 은 statistic_support_click.target VARCHAR(20) 기준.
 */
public record StatisticSupportClickRequest(
        @Size(max = 20)
        String target
) {
}
