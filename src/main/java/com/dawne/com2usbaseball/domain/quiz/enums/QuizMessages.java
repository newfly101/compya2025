package com.dawne.com2usbaseball.domain.quiz.enums;

public enum QuizMessages {
    QUIZ_SUCCESS,
    QUIZ_CREATED,
    QUIZ_CREATED_FAILED,
    QUIZ_UPDATED,
    QUIZ_UPDATED_FAILED,
    QUIZ_DELETED,
    QUIZ_DELETED_FAILED,
    QUIZ_NOT_FOUND,
    QUIZ_LATEST_NOT_FOUND,
    QUIZ_ROUND_DUPLICATED,

    // 일괄 작업 (일괄 노출변경은 visible 컬럼 부재로 제공하지 않음)
    QUIZ_BULK_DELETED
}
