package com.dawne.com2usbaseball.domain.quiz.service;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.quiz.dto.response.QuizAnswerResponse;
import com.dawne.com2usbaseball.domain.quiz.entity.QuizAnswerEntity;
import com.dawne.com2usbaseball.domain.quiz.enums.QuizAnswerMessages;

public interface QuizAnswerAdminService {
    ListResponse<QuizAnswerResponse> getAll();
    OperationResponse<QuizAnswerMessages> create(QuizAnswerEntity entity);
    OperationResponse<QuizAnswerMessages> update(QuizAnswerEntity entity);
    OperationResponse<QuizAnswerMessages> updateVisible(Long id, boolean visible);
}
