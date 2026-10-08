package com.dawne.com2usbaseball.domain.chat.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

/** type=MESSAGE → message, type=DELETE → id. 나머지 필드는 직렬화에서 빠진다. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ChatEnvelope(String type, ChatMessageResponse message, String id) {

    public static ChatEnvelope message(ChatMessageResponse message) {
        return new ChatEnvelope("MESSAGE", message, null);
    }

    public static ChatEnvelope delete(String id) {
        return new ChatEnvelope("DELETE", null, id);
    }
}
