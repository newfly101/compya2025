package com.dawne.com2usbaseball.domain.admin.controller;

import com.dawne.com2usbaseball.security.provider.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

//@Profile("dev")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dev")
public class SwaggerController {

    private final JwtProvider jwtProvider;

    @GetMapping("/token")
    public String getTestToken(@RequestParam int userId) {
        return jwtProvider.createAccessToken(userId);
    }
}
