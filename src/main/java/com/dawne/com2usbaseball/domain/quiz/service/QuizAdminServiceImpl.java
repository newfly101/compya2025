package com.dawne.com2usbaseball.domain.quiz.service;

import com.dawne.com2usbaseball.common.support.dto.BulkOperationResponse;
import com.dawne.com2usbaseball.domain.quiz.dto.mapstruct.QuizMapStruct;
import com.dawne.com2usbaseball.domain.quiz.dto.request.QuizRequest;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizResponse;
import com.dawne.com2usbaseball.domain.quiz.entity.QuizEntity;
import com.dawne.com2usbaseball.domain.quiz.enums.QuizMessages;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.quiz.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizAdminServiceImpl implements QuizAdminService {

    private final QuizRepository repository;
    private final QuizMapStruct quizMapStruct;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "quiz", key = "'admin'")
    public List<QuizResponse> getAll() {
        List<QuizEntity> quizList = repository.findAll();
        return quizMapStruct.toResponseList(quizList);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "quiz", key = "'admin'"),
            @CacheEvict(value = "quiz", key = "'latest'")
    })
    public QuizResponse createQuiz(QuizRequest request) {
        QuizEntity entity = quizMapStruct.toEntity(request);
        try {
            if (!repository.save(entity)) {
                throw new BaseException(QuizMessages.QUIZ_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (DuplicateKeyException e) {
            // round UNIQUE 제약 (uq_round) 위반 — admin inline error 로 안내
            throw new BaseException(QuizMessages.QUIZ_ROUND_DUPLICATED, HttpStatus.CONFLICT);
        }
        // insertQuiz useGeneratedKeys로 entity.id가 채워짐
        QuizEntity saved = repository.findById(entity.getId())
                .orElseThrow(() -> new BaseException(QuizMessages.QUIZ_CREATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR));
        return quizMapStruct.toResponse(saved);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "quiz", key = "'admin'"),
            @CacheEvict(value = "quiz", key = "'latest'")
    })
    public QuizResponse updateQuiz(Long id, QuizRequest request) {
        QuizEntity entity = repository.findById(id)
                .orElseThrow(() -> new BaseException(QuizMessages.QUIZ_NOT_FOUND, HttpStatus.NOT_FOUND));
        quizMapStruct.updateEntity(request, entity);
        try {
            if (!repository.update(entity)) {
                throw new BaseException(QuizMessages.QUIZ_UPDATED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } catch (DuplicateKeyException e) {
            // round UNIQUE 제약 (uq_round) 위반 — admin inline error 로 안내
            throw new BaseException(QuizMessages.QUIZ_ROUND_DUPLICATED, HttpStatus.CONFLICT);
        }
        return quizMapStruct.toResponse(entity);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "quiz", key = "'admin'"),
            @CacheEvict(value = "quiz", key = "'latest'")
    })
    public void deleteQuiz(Long id) {
        // 존재 여부 먼저 확인
        repository.findById(id)
                .orElseThrow(() -> new BaseException(QuizMessages.QUIZ_NOT_FOUND, HttpStatus.NOT_FOUND));
        if (!repository.delete(id)) {
            throw new BaseException(QuizMessages.QUIZ_DELETED_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 일괄 삭제 — 존재하는 id만 삭제, 존재하지 않는 id는 실패 목록으로 반환(전체 롤백 X)
    @Override
    @Caching(evict = {
            @CacheEvict(value = "quiz", key = "'admin'"),
            @CacheEvict(value = "quiz", key = "'latest'")
    })
    public BulkOperationResponse bulkDeleteQuizzes(List<Long> ids) {
        List<Long> requestedIds = normalizeIds(ids);
        if (requestedIds.isEmpty()) {
            return BulkOperationResponse.empty();
        }

        List<Long> existingIds = repository.selectExistingIds(requestedIds);
        List<Long> failedIds = requestedIds.stream().filter(id -> !existingIds.contains(id)).toList();

        if (!existingIds.isEmpty()) {
            repository.deleteQuizzesByIds(existingIds);
        }
        return BulkOperationResponse.of(existingIds, failedIds);
    }

    private List<Long> normalizeIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        return ids.stream().filter(java.util.Objects::nonNull).distinct().toList();
    }
}
