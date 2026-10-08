package com.dawne.com2usbaseball.domain.gamification.dto.response;

import java.util.List;

public record LedgerPageResponse(String publicId, int xp, int point, List<LedgerItemResponse> items) {
}
