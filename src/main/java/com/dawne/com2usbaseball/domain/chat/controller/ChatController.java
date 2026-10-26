package com.dawne.com2usbaseball.domain.chat.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatGuestResponse;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatMessageResponse;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatPresenceResponse;
import com.dawne.com2usbaseball.domain.chat.enums.ChatMessages;
import com.dawne.com2usbaseball.domain.chat.service.ChatGuestService;
import com.dawne.com2usbaseball.domain.chat.service.ChatPresenceService;
import com.dawne.com2usbaseball.domain.chat.service.ChatService;
import com.dawne.com2usbaseball.domain.chat.repository.ChatRepository;
import com.dawne.com2usbaseball.security.cookie.AuthCookieFactory;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.CookieValue;
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
    private final ChatGuestService guestService;
    private final ChatPresenceService presenceService;
    private final AuthCookieFactory cookieFactory;

    /** 게스트 번호 발급. 유효한 CHAT_GUEST 쿠키면 같은 번호, 아니면 새로 발급하고 쿠키를 심는다. */
    @GetMapping("/guest")
    public GlobalResponse<ChatGuestResponse> issueGuest(
            @CookieValue(name = AuthCookieFactory.CHAT_GUEST, required = false) String guestToken,
            HttpServletRequest request, HttpServletResponse response) {
        ChatGuestService.Issued issued = guestService.issue(guestToken);
        if (issued.token() != null) {
            response.addHeader(HttpHeaders.SET_COOKIE,
                    cookieFactory.createChatGuest(issued.token(), ChatRepository.GUEST_TTL, request).toString());
        }
        return GlobalResponse.success(ChatMessages.CHAT_SUCCESS, new ChatGuestResponse(issued.name()));
    }

    @GetMapping("/online")
    public GlobalResponse<ChatPresenceResponse> getOnline() {
        return GlobalResponse.success(ChatMessages.CHAT_SUCCESS, presenceService.getCount());
    }

    @GetMapping("/messages")
    public GlobalResponse<List<ChatMessageResponse>> getMessages() {
        return GlobalResponse.success(ChatMessages.CHAT_SUCCESS, chatService.getRecent());
    }
}
