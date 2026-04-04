package com.dawne.com2usbaseball.domain.quiz.exception;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import org.springframework.http.HttpStatus;

public class QuizException extends BaseException {
    public QuizException(Enum<?> code, HttpStatus status) {
        super(code, status);
    }
}
