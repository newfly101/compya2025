package com.dawne.com2usbaseball.domain.quiz.service;

import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizAnswerResponse;
import com.dawne.com2usbaseball.domain.quiz.repository.QuizAnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizAnswerUserServiceImpl implements QuizAnswerUserService {

    private final QuizAnswerRepository repository;

    @Override
    @Cacheable(value = "quizAnswers", key = "'latest'")
    public Optional<QuizAnswerResponse> getLatest() {
        return repository.findLatestVisible().map(QuizAnswerResponse::from);
    }
}
