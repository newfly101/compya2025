package com.dawne.com2usbaseball.domain.quiz.controller;

import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizAnswerResponse;
import com.dawne.com2usbaseball.domain.quiz.service.QuizAnswerUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/quiz-answers")
public class QuizAnswerController {

    private final QuizAnswerUserService quizAnswerUserService;

    @GetMapping("/latest")
    public Optional<QuizAnswerResponse> getLatest() {
        return quizAnswerUserService.getLatest();
    }
}
