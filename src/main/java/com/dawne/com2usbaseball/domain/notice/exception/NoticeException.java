package com.dawne.com2usbaseball.domain.notice.exception;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import org.springframework.http.HttpStatus;

public class NoticeException extends BaseException {
    public NoticeException(Enum<?> code, HttpStatus status) {
        super(code, status);
    }
}
