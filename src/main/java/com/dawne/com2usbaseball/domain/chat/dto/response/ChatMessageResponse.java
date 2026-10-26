package com.dawne.com2usbaseball.domain.chat.dto.response;

import java.time.Instant;
import java.util.UUID;

/** 사용자 id 는 담지 않는다. createdAt 은 ISO-8601(UTC). level·title 은 보낸 시점 값(이전 글은 null). */
public record ChatMessageResponse(String id, String senderType, String nickname, Integer level, String title,
                                  String body, String createdAt) {

    /** senderType: USER · ADMIN(관리자 글, 화면에서 강조) */
    public static ChatMessageResponse ofUser(boolean admin, String nickname, Integer level, String title, String body) {
        return new ChatMessageResponse(UUID.randomUUID().toString(), admin ? "ADMIN" : "USER", nickname, level, title, body, Instant.now().toString());
    }
}
