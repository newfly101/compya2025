package com.dawne.com2usbaseball.domain.coupon.exception;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import org.springframework.http.HttpStatus;

public class CouponException extends BaseException {
    public CouponException(Enum<?> code, HttpStatus status) {
        super(code, status);
    }
}
