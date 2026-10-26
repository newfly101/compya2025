package com.dawne.com2usbaseball.domain.chat.dto.response;

import com.dawne.com2usbaseball.domain.chat.enums.ChatPresenceKind;
import com.fasterxml.jackson.annotation.JsonInclude;

/** Valkey presence Hash 의 value. 내부 전용 — 공개 응답에 절대 노출하지 않는다. GUEST 는 userId 없음, 번호 없는 게스트는 name null. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ChatPresenceEntry(ChatPresenceKind kind, String name, Long userId) {
}
