package com.dawne.com2usbaseball.domain.notice.dto.request;

import jakarta.validation.constraints.NotNull;

public record NoticePinnedRequest(
        @NotNull Boolean isPinned
) {}
