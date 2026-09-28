package com.dawne.com2usbaseball.common.support.advice;

import com.dawne.com2usbaseball.common.enums.CommonMessages;
import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.admin.enums.UploadMessages;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

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

    /** 없는 경로 — 존재하는 컨트롤러 매핑 자체가 없을 때. 구체 타입이라 catch-all 보다 먼저 매칭된다. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<GlobalResponse<Void>> handleNoResourceFoundException(NoResourceFoundException e) {
        log.warn("요청 경로 없음: {}", e.getResourcePath());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(GlobalResponse.fail(CommonMessages.NOT_FOUND));
    }

    /**
     * 요청 자체가 형식적으로 잘못된 경우 — 깨진/빈 JSON 바디, 경로·쿼리 타입 불일치, 필수 파라미터 누락.
     * 서버 장애(500)가 아니라 클라이언트 요청 문제이므로 400 으로 내린다.
     */
    @ExceptionHandler({
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
    })
    public ResponseEntity<GlobalResponse<Void>> handleBadRequest(Exception e) {
        log.warn("잘못된 요청: {}", e.getMessage());
        return ResponseEntity
                .badRequest()
                .body(GlobalResponse.fail(CommonMessages.INVALID_REQUEST));
    }

    /** 허용 안 된 HTTP 메서드 — 의미대로 405. */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<GlobalResponse<Void>> handleMethodNotAllowed(HttpRequestMethodNotSupportedException e) {
        log.warn("허용 안 된 메서드: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(GlobalResponse.fail(CommonMessages.INVALID_REQUEST));
    }

    /** 허용 안 된 Content-Type — 의미대로 415. */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<GlobalResponse<Void>> handleUnsupportedMediaType(HttpMediaTypeNotSupportedException e) {
        log.warn("허용 안 된 Content-Type: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(GlobalResponse.fail(CommonMessages.INVALID_REQUEST));
    }

    /**
     * 업로드 용량 초과 — 서블릿 한계(멀티파트 파싱 단계)에서 앱 코드에 닿기 전에 터지므로
     * UploadServiceImpl.validateSize 의 UPLOAD_FILE_TOO_LARGE 가 도달하지 못한다. 여기서 같은 메시지로 응답한다.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<GlobalResponse<Void>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException e) {
        log.warn("업로드 용량 초과: {}", e.getMessage());
        return ResponseEntity
                .badRequest()
                .body(GlobalResponse.fail(UploadMessages.UPLOAD_FILE_TOO_LARGE));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<GlobalResponse<Void>> handleException(Exception e) {
        log.error("Unhandled Exception", e);
        return ResponseEntity
                .status(500)
                .body(GlobalResponse.fail(CommonMessages.INTERNAL_SERVER_ERROR));
    }
}
