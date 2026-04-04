package com.dawne.com2usbaseball.domain.event.exception;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import org.springframework.http.HttpStatus;

public class EventException extends BaseException {
    public EventException(Enum<?> code, HttpStatus status) {
        super(code, status);
    }
}
