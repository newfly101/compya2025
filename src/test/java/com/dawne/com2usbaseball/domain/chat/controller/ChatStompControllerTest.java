package com.dawne.com2usbaseball.domain.chat.controller;

import com.dawne.com2usbaseball.domain.chat.dto.request.ChatSendRequest;
import com.dawne.com2usbaseball.domain.chat.service.ChatService;
import com.dawne.com2usbaseball.domain.chat.service.support.ChatGuestPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.List;

import static org.mockito.Mockito.*;

class ChatStompControllerTest {

    private final ChatService chatService = mock(ChatService.class);
    private final ChatStompController controller = new ChatStompController(chatService);

    @Test
    @DisplayName("게스트 Principal 은 예외 없이 userId null 로 넘어가 서비스가 거부한다")
    void 게스트_send_userId_null() {
        controller.send(new ChatSendRequest("안녕"), new ChatGuestPrincipal("guest00042"));
        verify(chatService).send(null, "안녕");
    }

    @Test
    @DisplayName("Principal 없음도 userId null")
    void principal_없음() {
        controller.send(new ChatSendRequest("안녕"), null);
        verify(chatService).send(null, "안녕");
    }

    @Test
    @DisplayName("로그인 Principal 은 userId 를 넘긴다")
    void 로그인_send() {
        controller.send(new ChatSendRequest("안녕"), new UsernamePasswordAuthenticationToken(7L, null, List.of()));
        verify(chatService).send(7L, "안녕");
    }
}
