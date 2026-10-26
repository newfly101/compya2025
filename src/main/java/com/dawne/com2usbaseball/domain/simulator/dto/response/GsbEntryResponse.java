package com.dawne.com2usbaseball.domain.simulator.dto.response;

import java.util.List;

public record GsbEntryResponse(String legendId, int gsbCount, int selCount, List<String> skillIds, List<String> skillTiers) {
}
