package com.dawne.com2usbaseball.domain.chat.dto.response;

import java.time.Instant;
import java.util.UUID;

/** 사용자 id 는 담지 않는다. createdAt 은 ISO-8601(UTC). */
public record ChatMessageResponse(String id, String senderType, String nickname, String body, String createdAt) {

    public static ChatMessageResponse ofUser(String nickname, String body) {
        return new ChatMessageResponse(UUID.randomUUID().toString(), "USER", nickname, body, Instant.now().toString());
    }
}
