package com.dawne.com2usbaseball.domain.quiz.service;

import com.dawne.com2usbaseball.domain.quiz.dto.mapstruct.QuizMapStruct;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;
import com.dawne.com2usbaseball.domain.quiz.entity.QuizEntity;
import com.dawne.com2usbaseball.domain.quiz.enums.QuizMessages;
import com.dawne.com2usbaseball.domain.quiz.exception.QuizException;
import com.dawne.com2usbaseball.domain.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizUserServiceImpl implements QuizUserService {

    private final QuizRepository repository;
    private final QuizMapStruct quizMapStruct;

    @Override
    @Cacheable(value = "quiz", key = "'latest'")
    public QuizResponse getLatest() {
        QuizEntity entity = repository.findLatestVisible()
                .orElseThrow(() -> new QuizException(QuizMessages.QUIZ_LATEST_NOT_FOUND, HttpStatus.NOT_FOUND));
        return quizMapStruct.toResponse(entity);
    }
}
