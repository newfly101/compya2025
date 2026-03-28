package com.dawne.com2usbaseball.domain.quiz.dto.request;

import com.dawne.com2usbaseball.domain.quiz.entity.QuizAnswerEntity;

public record ChangeQuizAnswerRequest(
        Integer round,
        String title,
        String imageUrl,
        boolean visible
) {
    public QuizAnswerEntity toEntity() {
        QuizAnswerEntity e = new QuizAnswerEntity();
        applyTo(e);
        return e;
    }

    public QuizAnswerEntity toEntity(Long id) {
        QuizAnswerEntity e = new QuizAnswerEntity();
        e.setId(id);
        applyTo(e);
        return e;
    }

    private void applyTo(QuizAnswerEntity e) {
        e.setRound(round);
        e.setTitle(title);
        e.setImageUrl(imageUrl);
        e.setVisible(visible);
    }
}
