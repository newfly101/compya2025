package com.dawne.com2usbaseball.domain.chat.service.support;

import java.security.Principal;

/** 번호를 받은 게스트의 STOMP 신원. 이름 = guest00042. 로그인 사용자가 아니므로 전송 권한이 없다. */
public record ChatGuestPrincipal(String name) implements Principal {

    @Override
    public String getName() {
        return name;
    }
}
