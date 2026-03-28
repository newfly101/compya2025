package com.dawne.com2usbaseball.domain.quiz.service;

import com.dawne.com2usbaseball.common.support.ListAssembler;
import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizAnswerResponse;
import com.dawne.com2usbaseball.domain.quiz.entity.QuizAnswerEntity;
import com.dawne.com2usbaseball.domain.quiz.enums.QuizAnswerMessages;
import com.dawne.com2usbaseball.domain.quiz.repository.QuizAnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizAnswerAdminServiceImpl implements QuizAnswerAdminService {

    private final QuizAnswerRepository repository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "quizAnswers", key = "'admin::all'")
    public ListResponse<QuizAnswerResponse> getAll() {
        return ListAssembler.assemble(repository.findAll(), QuizAnswerResponse::from);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "quizAnswers", key = "'admin::all'"),
            @CacheEvict(value = "quizAnswers", key = "'latest'")
    })
    public OperationResponse<QuizAnswerMessages> create(QuizAnswerEntity entity) {
        return repository.save(entity)
                ? OperationResponse.success(QuizAnswerMessages.CREATED, entity.getId())
                : OperationResponse.fail(QuizAnswerMessages.FAILED);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "quizAnswers", key = "'admin::all'"),
            @CacheEvict(value = "quizAnswers", key = "'latest'")
    })
    public OperationResponse<QuizAnswerMessages> update(QuizAnswerEntity entity) {
        return repository.update(entity)
                ? OperationResponse.success(QuizAnswerMessages.UPDATED, entity.getId())
                : OperationResponse.fail(QuizAnswerMessages.FAILED);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "quizAnswers", key = "'admin::all'"),
            @CacheEvict(value = "quizAnswers", key = "'latest'")
    })
    public OperationResponse<QuizAnswerMessages> updateVisible(Long id, boolean visible) {
        return repository.updateVisible(id, visible)
                ? OperationResponse.success(QuizAnswerMessages.VISIBLE_UPDATED, id)
                : OperationResponse.fail(QuizAnswerMessages.FAILED);
    }
}
