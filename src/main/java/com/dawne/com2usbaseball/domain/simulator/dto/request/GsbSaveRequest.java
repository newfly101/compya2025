package com.dawne.com2usbaseball.domain.simulator.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record GsbSaveRequest(@NotNull @Size(min = 1, max = 100) @Valid List<@Valid GsbEntryRequest> items) {
}
