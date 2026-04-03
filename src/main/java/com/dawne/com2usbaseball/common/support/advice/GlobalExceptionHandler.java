package com.dawne.com2usbaseball.common.support.advice;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<GlobalResponse<Void>> handle(BaseException e) {

        Enum<?> message = e.getCode();

        return ResponseEntity
                .status(e.getStatus())
                .body(GlobalResponse.fail(
                        message.name()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalResponse<Void>> handleException(Exception e) {

        log.error("Unhandled Exception", e);

        return ResponseEntity
                .status(500)
                .body(GlobalResponse.fail("COMMON_500"));
    }
}
