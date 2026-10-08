package com.dawne.com2usbaseball.domain.chat.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatMessageResponse;
import com.dawne.com2usbaseball.domain.chat.enums.ChatMessages;
import com.dawne.com2usbaseball.domain.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/messages")
    public GlobalResponse<List<ChatMessageResponse>> getMessages() {
        return GlobalResponse.success(ChatMessages.CHAT_SUCCESS, chatService.getRecent());
    }
}
