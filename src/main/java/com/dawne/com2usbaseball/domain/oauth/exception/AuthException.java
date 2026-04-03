package com.dawne.com2usbaseball.domain.oauth.exception;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import org.springframework.http.HttpStatus;

public class AuthException extends BaseException {

    public AuthException(AuthMessages message, HttpStatus status) {
        super(message, status);
    }
}
