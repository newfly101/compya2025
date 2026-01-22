package com.dawne.com2usbaseball.config.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "naver")
public class NaverOauthProperties {
    private String clientId;
    private String clientSecret;
    private String redirectUri;
}
