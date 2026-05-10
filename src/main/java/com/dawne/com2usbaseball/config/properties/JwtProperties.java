package com.dawne.com2usbaseball.config.properties;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.charset.StandardCharsets;

@Getter
@Setter
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret;
    private long accessTokenExpireMinutes;

    @PostConstruct
    void validate() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("jwt.secret must be >= 32 bytes (HS256)");
        }
        if (accessTokenExpireMinutes <= 0) {
            throw new IllegalStateException("jwt.access-token-expire-minutes must be > 0");
        }
    }
}
