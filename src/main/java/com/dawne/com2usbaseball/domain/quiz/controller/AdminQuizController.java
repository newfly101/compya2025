package com.dawne.com2usbaseball.domain.quiz.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.quiz.controller.docs.AdminQuizSwaggerDocs;
import com.dawne.com2usbaseball.domain.quiz.dto.request.QuizRequest;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;
import com.dawne.com2usbaseball.domain.quiz.enums.QuizMessages;
import com.dawne.com2usbaseball.domain.quiz.service.QuizAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/quiz")
public class AdminQuizController implements AdminQuizSwaggerDocs {

    private final QuizAdminService quizAdminService;

    @Override
    @GetMapping
    public GlobalResponse<List<QuizResponse>> getAll() {
        List<QuizResponse> quizList = quizAdminService.getAll();
        return GlobalResponse.success(QuizMessages.QUIZ_SUCCESS, quizList);
    }

    @Override
    @PostMapping
    public GlobalResponse<QuizResponse> create(@RequestBody QuizRequest request) {
        QuizResponse newQuiz = quizAdminService.createQuiz(request);
        return GlobalResponse.success(QuizMessages.QUIZ_CREATED, newQuiz);
    }

    @Override
    @PatchMapping("/{id}")
    public GlobalResponse<QuizResponse> update(@PathVariable Long id,
                                               @RequestBody QuizRequest request) {
        QuizResponse updatedQuiz = quizAdminService.updateQuiz(id, request);
        return GlobalResponse.success(QuizMessages.QUIZ_UPDATED, updatedQuiz);
    }

    @Override
    @DeleteMapping("/{id}")
    public GlobalResponse<Void> delete(@PathVariable Long id) {
        quizAdminService.deleteQuiz(id);
        return GlobalResponse.success(QuizMessages.QUIZ_DELETED, null);
    }
}
