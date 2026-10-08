package com.dawne.com2usbaseball.domain.gamification.dto.response;

import java.util.List;

/** dryRun=true 면 대상 수·샘플만, false 면 실제 지급 시도한 수. */
public record EarlyAdopterGrantResponse(boolean dryRun, int founderCount, List<String> samplePublicIds) {
}
