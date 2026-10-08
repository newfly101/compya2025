package com.dawne.com2usbaseball.domain.chat.enums;

public enum ChatMessages {
    CHAT_SUCCESS,
    CHAT_DELETED,
    CHAT_MESSAGE_NOT_FOUND,

    // STOMP 오류 코드 (/user/queue/chats.errors 로 {"code": 이름} 전달)
    CHAT_UNAUTHORIZED,
    CHAT_NICKNAME_REQUIRED,
    CHAT_TOO_LONG,
    CHAT_TOO_MANY_LINES,
    CHAT_MARKUP_NOT_ALLOWED,
    CHAT_RATE_LIMITED
}
