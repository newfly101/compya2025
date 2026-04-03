package com.dawne.com2usbaseball.common.support.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BaseException extends RuntimeException {

    private final Enum<?> code;
    private final HttpStatus status;

    public BaseException(Enum<?> code, HttpStatus status) {
        this.code = code;
        this.status = status;
    }
}
