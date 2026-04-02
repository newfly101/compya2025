package com.dawne.com2usbaseball.domain.quiz.dto.response;

import com.dawne.com2usbaseball.domain.quiz.entity.QuizAnswerEntity;

public record QuizAnswerResponse(
        Long id,
        Integer round,
        String title,
        String imageUrl,
        boolean visible
) {
    public static QuizAnswerResponse from(QuizAnswerEntity e) {
        return new QuizAnswerResponse(
                e.getId(),
                e.getRound(),
                e.getTitle(),
                e.getImageUrl(),
                e.isVisible()
        );
    }
}
