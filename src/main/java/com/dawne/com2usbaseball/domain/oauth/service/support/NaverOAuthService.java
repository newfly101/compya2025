// NaverOAuthService.java
package com.dawne.com2usbaseball.domain.oauth.service.support;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.config.properties.NaverOauthProperties;
import com.dawne.com2usbaseball.domain.oauth.dto.response.NaverOAuthUserResponse;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.domain.oauth.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NaverOAuthService {

    private final NaverOauthProperties naverProperties;
    private final UserService userService;
    private final RestTemplate restTemplate = new RestTemplate();

    public UserEntity findOrCreateUser(String code, String state) {
        NaverOAuthUserResponse userInfo = getUserInfo(code, state);
        return userService.findOrCreateNaverUser(userInfo);
    }

    public NaverOAuthUserResponse getUserInfo(String code, String state) {
        String accessToken = getAccessToken(code, state);
        return requestUserInfo(accessToken);
    }

    private String getAccessToken(String code, String state) {
        String url = "https://nid.naver.com/oauth2.0/token" +
                "?grant_type=authorization_code" +
                "&client_id=" + naverProperties.getClientId() +
                "&client_secret=" + naverProperties.getClientSecret() +
                "&code=" + code +
                "&state=" + state +
                "&redirect_uri=" + naverProperties.getRedirectUri();

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        log.trace("NAVER TOKEN RESPONSE = {}", response);

        if (response == null || !response.containsKey("access_token")) {
            throw new BaseException(AuthMessages.AUTH_NAVER_TOKEN_FAILED, HttpStatus.BAD_GATEWAY);
        }

        return (String) response.get("access_token");
    }

    private NaverOAuthUserResponse requestUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://openapi.naver.com/v1/nid/me",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
        );

        return parseUserInfo(response.getBody());
    }

    private NaverOAuthUserResponse parseUserInfo(Map<String, Object> body) {
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
