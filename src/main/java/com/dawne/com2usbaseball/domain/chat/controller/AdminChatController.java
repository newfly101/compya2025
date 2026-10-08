package com.dawne.com2usbaseball.domain.chat.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.chat.enums.ChatMessages;
import com.dawne.com2usbaseball.domain.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/chats")
public class AdminChatController {

    private final ChatService chatService;

    @DeleteMapping("/messages/{messageId}")
    public GlobalResponse<Void> deleteMessage(@PathVariable String messageId) {
        chatService.delete(messageId);
        return GlobalResponse.success(ChatMessages.CHAT_DELETED, null);
    }
}
