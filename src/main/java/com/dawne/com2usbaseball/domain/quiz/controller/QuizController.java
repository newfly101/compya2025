package com.dawne.com2usbaseball.domain.quiz.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.quiz.controller.docs.QuizSwaggerDocs;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;
import com.dawne.com2usbaseball.domain.quiz.enums.QuizMessages;
import com.dawne.com2usbaseball.domain.quiz.service.QuizUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/quiz")
public class QuizController implements QuizSwaggerDocs {

    private final QuizUserService quizUserService;

    @Override
    @GetMapping("/latest")
    public GlobalResponse<QuizResponse> getLatest() {
        QuizResponse latest = quizUserService.getLatest();
        if (latest == null) {
            // 서비스가 null 을 반환하는 이유(캐시에 not-found 상태를 올리기 위함)는 QuizUserServiceImpl 참고
            throw new BaseException(QuizMessages.QUIZ_LATEST_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return GlobalResponse.success(QuizMessages.QUIZ_SUCCESS, latest);
    }
}
