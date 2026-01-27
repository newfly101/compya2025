package com.dawne.com2usbaseball.controller.auth.support;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthRedirectProvider {

    public String setRedirectUrl(HttpServletRequest request) {
        return request.getServerName().equals("localhost")
                ? "http://localhost:3000/auth/callback"
                : "https://compyafun.com/auth/callback";
    }
}
