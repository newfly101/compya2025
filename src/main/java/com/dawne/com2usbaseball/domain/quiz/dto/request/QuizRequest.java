package com.dawne.com2usbaseball.domain.quiz.dto.request;

public record QuizRequest(
        Integer round,
        String imageUrl,
        boolean isVisible
) {}
