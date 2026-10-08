package com.dawne.com2usbaseball.domain.chat.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatEnvelope;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatMessageResponse;
import com.dawne.com2usbaseball.domain.chat.enums.ChatMessages;
import com.dawne.com2usbaseball.domain.chat.repository.ChatRepository;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/** Valkey 만 쓰므로 @Transactional 없음(DB 는 닉네임 조회 1회). 단일 클래스 — public 메서드 3개. */
@Service
@RequiredArgsConstructor
public class ChatService {

    public static final int MAX_BODY_LENGTH = 200;
    public static final int MAX_LINES = 5;

    /** 태그 시작으로 보이는 것(<b, </div, <!--). "<3", "a < b", "<<" 는 통과 — 브라우저도 태그로 안 읽는다. */
    private static final Pattern MARKUP = Pattern.compile("<[/!]?[a-zA-Z!-]");

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /** userId 가 null 이면 익명. 실패는 BaseException(코드 = STOMP 오류 코드). 화면 전달은 Pub/Sub 리스너 몫. */
    public void send(Long userId, String rawBody) {
        if (userId == null) {
            throw new BaseException(ChatMessages.CHAT_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseException(ChatMessages.CHAT_UNAUTHORIZED, HttpStatus.UNAUTHORIZED));
        String nickname = user.getNickname();
        if (nickname == null || nickname.endsWith("***")) {
            throw new BaseException(ChatMessages.CHAT_NICKNAME_REQUIRED, HttpStatus.FORBIDDEN);
        }
        String body = rawBody == null ? "" : rawBody.trim();
        if (body.isEmpty() || body.length() > MAX_BODY_LENGTH) {
            throw new BaseException(ChatMessages.CHAT_TOO_LONG, HttpStatus.BAD_REQUEST);
        }
        // 줄바꿈으로 채팅창을 도배하지 못하게 — \r\n 도 줄 하나로 센다
        if (body.lines().count() > MAX_LINES) {
            throw new BaseException(ChatMessages.CHAT_TOO_MANY_LINES, HttpStatus.BAD_REQUEST);
        }
        if (MARKUP.matcher(body).find()) {
            throw new BaseException(ChatMessages.CHAT_MARKUP_NOT_ALLOWED, HttpStatus.BAD_REQUEST);
        }
        // 검증을 다 통과한 뒤에 소모해야 잘못된 입력이 3초 대기를 먹지 않는다
        if (!chatRepository.acquireRateLimit(userId)) {
            throw new BaseException(ChatMessages.CHAT_RATE_LIMITED, HttpStatus.TOO_MANY_REQUESTS);
        }
        ChatMessageResponse message = ChatMessageResponse.ofUser(nickname, body);
        chatRepository.push(toJson(message));
        chatRepository.publish(toJson(ChatEnvelope.message(message)));
    }

    public List<ChatMessageResponse> getRecent() {
        List<ChatMessageResponse> result = new ArrayList<>();
        for (String json : chatRepository.findAll()) {
            result.add(fromJson(json));
        }
        return result;
    }

    public void delete(String id) {
        for (String json : chatRepository.findAll()) {
            if (id.equals(fromJson(json).id())) {
                chatRepository.remove(json);
                chatRepository.publish(toJson(ChatEnvelope.delete(id)));
                return;
            }
        }
        throw new BaseException(ChatMessages.CHAT_MESSAGE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    private String toJson(Object o) {
        try {
            return objectMapper.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    private ChatMessageResponse fromJson(String json) {
        try {
            return objectMapper.readValue(json, ChatMessageResponse.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }
}
