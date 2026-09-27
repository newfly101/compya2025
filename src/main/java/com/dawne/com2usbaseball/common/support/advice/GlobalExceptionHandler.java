package com.dawne.com2usbaseball.common.support.advice;

import com.dawne.com2usbaseball.common.enums.CommonMessages;
import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<GlobalResponse<Void>> handle(BaseException e) {
        log.warn("[{}] {} (status={})", e.getDomain(), e.getCode(), e.getStatus());
        return ResponseEntity
                .status(e.getStatus())
                .body(GlobalResponse.fail(e.getCode()));
    }

    /**
     * 요청 검증 실패 — 잘못된 입력이지 서버 장애가 아니므로 400 으로 내린다.
     * MethodArgumentNotValidException(@RequestBody) 은 BindException 의 하위라 함께 잡히고,
     * 쿼리 파라미터 바인딩(@ModelAttribute) 실패도 BindException 으로 온다.
     * 아래 catch-all 보다 구체 타입이 먼저 매칭되므로 순서 지정은 필요 없다.
     * 어떤 값이 왜 거부됐는지는 로그에만 남긴다(응답으로 내부 메시지를 노출하지 않는다).
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<GlobalResponse<Void>> handleBindException(BindException e) {
        log.warn("요청 검증 실패: {}", e.getFieldErrors());
        return ResponseEntity
                .badRequest()
                .body(GlobalResponse.fail(CommonMessages.INVALID_REQUEST));
    }

    /** @Validated 가 붙은 빈의 메서드 파라미터 검증 실패 경로. */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<GlobalResponse<Void>> handleConstraintViolationException(ConstraintViolationException e) {
        log.warn("요청 검증 실패: {}", e.getMessage());
        return ResponseEntity
                .badRequest()
                .body(GlobalResponse.fail(CommonMessages.INVALID_REQUEST));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalResponse<Void>> handleException(Exception e) {
        log.error("Unhandled Exception", e);
        return ResponseEntity
                .status(500)
                .body(GlobalResponse.fail(CommonMessages.INTERNAL_SERVER_ERROR));
    }
}
