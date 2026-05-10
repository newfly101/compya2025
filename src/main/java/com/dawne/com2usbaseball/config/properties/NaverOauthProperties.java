package com.dawne.com2usbaseball.config.properties;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "naver")
public class NaverOauthProperties {
    private String clientId;
    private String clientSecret;
    private String redirectUri;

    @PostConstruct
    void validate() {
        if (isBlank(clientId)) throw new IllegalStateException("naver.client-id must be set");
        if (isBlank(clientSecret)) throw new IllegalStateException("naver.client-secret must be set");
        if (isBlank(redirectUri)) throw new IllegalStateException("naver.redirect-uri must be set");
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
