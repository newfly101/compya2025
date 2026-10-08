package com.dawne.com2usbaseball.domain.gamification.dto.response;

import java.util.List;

/** 내 XP·포인트 내역 한 페이지. page 는 0부터. */
public record LedgerHistoryResponse(String type, int page, int size, boolean hasNext, List<LedgerItemResponse> items) {
}
