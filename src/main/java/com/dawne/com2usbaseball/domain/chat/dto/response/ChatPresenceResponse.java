package com.dawne.com2usbaseball.domain.chat.dto.response;

/** 공개 접속자 수. 이름·userId 는 담지 않는다. */
public record ChatPresenceResponse(int count) {
}
