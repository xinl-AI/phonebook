package com.phonebook.exception;

import lombok.Getter;

/**
 * 业务异常类
 * 在Service层抛出，由GlobalExceptionHandler统一处理
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}
