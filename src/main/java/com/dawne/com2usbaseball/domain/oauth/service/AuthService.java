package com.dawne.com2usbaseball.domain.oauth.service;

public interface AuthService {
    String loginWithNaver(String code, String state);
}
