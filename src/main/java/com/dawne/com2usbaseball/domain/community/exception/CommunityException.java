package com.dawne.com2usbaseball.domain.community.exception;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import org.springframework.http.HttpStatus;

public class CommunityException extends BaseException {

    public CommunityException(Enum<?> code, HttpStatus status) {
        super(code, status);
    }
}
