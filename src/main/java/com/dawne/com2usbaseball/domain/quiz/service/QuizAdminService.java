package com.dawne.com2usbaseball.domain.quiz.service;

import com.dawne.com2usbaseball.domain.quiz.dto.request.QuizRequest;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;

import java.util.List;

public interface QuizAdminService {
    List<QuizResponse> getAll();
    QuizResponse createQuiz(QuizRequest request);
    QuizResponse updateQuiz(Long id, QuizRequest request);
    void deleteQuiz(Long id);
}
