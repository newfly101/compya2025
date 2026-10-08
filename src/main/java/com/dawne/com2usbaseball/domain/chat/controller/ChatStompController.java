package com.dawne.com2usbaseball.domain.chat.controller;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.chat.dto.request.ChatSendRequest;
import com.dawne.com2usbaseball.domain.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

/** 전송 /app/chats.send. 여기서 /topic 으로 직접 보내지 않는다 — Pub/Sub 리스너가 전달. */
@Controller
@RequiredArgsConstructor
public class ChatStompController {

    private final ChatService chatService;

    @MessageMapping("/chats.send")
    public void send(ChatSendRequest request, Principal principal) {
        Long userId = principal == null ? null : Long.valueOf(principal.getName());
        chatService.send(userId, request == null ? null : request.body());
    }

    @MessageExceptionHandler(BaseException.class)
    @SendToUser("/queue/chats.errors")
    public Map<String, String> handleError(BaseException e) {
        return Map.of("code", e.getCode().name());
    }
}
