package com.dawne.com2usbaseball.domain.quiz.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.quiz.dto.request.ChangeQuizAnswerRequest;
import com.dawne.com2usbaseball.domain.quiz.dto.request.ChangeQuizAnswerVisibleRequest;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizAnswerResponse;
import com.dawne.com2usbaseball.domain.quiz.enums.QuizAnswerMessages;
import com.dawne.com2usbaseball.domain.quiz.service.QuizAnswerAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/quiz-answers")
public class AdminQuizAnswerController {

    private final QuizAnswerAdminService quizAnswerAdminService;

    @GetMapping
    public ListResponse<QuizAnswerResponse> getAll() {
        return quizAnswerAdminService.getAll();
    }

    @PostMapping
    public OperationResponse<QuizAnswerMessages> create(@RequestBody ChangeQuizAnswerRequest request) {
        return quizAnswerAdminService.create(request.toEntity());
    }

    @PatchMapping("/{id}")
    public OperationResponse<QuizAnswerMessages> update(@PathVariable Long id,
                                                         @RequestBody ChangeQuizAnswerRequest request) {
        return quizAnswerAdminService.update(request.toEntity(id));
    }

    @PatchMapping("/{id}/visible")
    public OperationResponse<QuizAnswerMessages> updateVisible(@PathVariable Long id,
                                                                @RequestBody ChangeQuizAnswerVisibleRequest request) {
        return quizAnswerAdminService.updateVisible(id, request.visible());
    }
}
