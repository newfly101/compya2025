package com.dawne.com2usbaseball.domain.statistics.dto.request;

/**
 * target 생략 시 서비스에서 "kakaopay" 로 기본 처리한다(현재 후원 수단이 카카오페이뿐).
 */
public record StatisticSupportClickRequest(String target) {
}
