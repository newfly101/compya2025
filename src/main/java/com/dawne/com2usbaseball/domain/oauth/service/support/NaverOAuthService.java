package com.dawne.com2usbaseball.domain.oauth.service.support;

import com.dawne.com2usbaseball.config.properties.NaverOauthProperties;
import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.HttpHeaders;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NaverOAuthService {
    private final NaverOauthProperties naverProperties;

    private final RestTemplate restTemplate = new RestTemplate();

    public NaverOAuthUserResponse getUserInfo(String code, String state) {
        String accessToken = getAccessToken(code, state);
        return requestUserInfo(accessToken);
    }

    // 1️⃣ code → access_token
    private String getAccessToken(String code, String state) {

        String url =
                "https://nid.naver.com/oauth2.0/token" +
                        "?grant_type=authorization_code" +
                        "&client_id=" + naverProperties.getClientId() +
                        "&client_secret=" + naverProperties.getClientSecret() +
                        "&code=" + code +
                        "&state=" + state +
                        "&redirect_uri=" + naverProperties.getRedirectUri();

        Map<String, Object> response =
                restTemplate.getForObject(url, Map.class);

        log.trace("🔥 NAVER TOKEN RESPONSE = {}", response);
        log.trace("NAVER CONFIG CHECK clientId=[{}], clientSecret=[{}], redirectUri=[{}]",
                naverProperties.getClientId(),
                naverProperties.getClientSecret(),
                naverProperties.getRedirectUri());

        if (response == null || !response.containsKey("access_token")) {
            throw new IllegalStateException(
                    "NAVER access_token 발급 실패: " + response
            );
        }

        return (String) response.get("access_token");
    }

    // 2️⃣ access_token → user info
    private NaverOAuthUserResponse requestUserInfo(String accessToken) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        HttpEntity<HttpHeaders> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://openapi.naver.com/v1/nid/me",
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map<String, Object> body = response.getBody();
        Map<String, Object> info = (Map<String, Object>) body.get("response");

        return new NaverOAuthUserResponse(
                (String) info.get("id"),
                (String) info.get("nickname"),
                (String) info.get("email"),
                (String) info.get("profile_image"),
                (String) info.get("age")
        );
    }

}
