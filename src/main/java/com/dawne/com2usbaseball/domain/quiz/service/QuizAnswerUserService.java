package com.dawne.com2usbaseball.domain.quiz.service;

import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizAnswerResponse;

import java.util.Optional;

public interface QuizAnswerUserService {
    Optional<QuizAnswerResponse> getLatest();
}
