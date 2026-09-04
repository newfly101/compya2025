package com.dawne.com2usbaseball.domain.quiz.service;

import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
import com.dawne.com2usbaseball.domain.quiz.dto.request.QuizRequest;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;

import java.util.List;

public interface QuizAdminService {
    List<QuizResponse> getAll();
    QuizResponse createQuiz(QuizRequest request);
    QuizResponse updateQuiz(Long id, QuizRequest request);
    void deleteQuiz(Long id);

    // 일괄 삭제 (일괄 노출변경은 fun_quiz에 visible 컬럼이 없어 제공하지 않음)
    BulkOperationResponse bulkDeleteQuizzes(List<Long> ids);
}
