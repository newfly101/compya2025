package com.dawne.com2usbaseball.domain.notice.dto.request;

import jakarta.validation.constraints.NotNull;

public record NoticeVisibleRequest(
        @NotNull Boolean isVisible
) {}
