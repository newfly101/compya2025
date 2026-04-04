package com.dawne.com2usbaseball.domain.quiz.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record QuizResponse(
        Long id,
        Integer round,
        String imageUrl,
        boolean isVisible,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime createdAt,
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        LocalDateTime updatedAt
) {}
