package com.dawne.com2usbaseball.domain.chat.service;

import com.dawne.com2usbaseball.domain.oauth.service.support.NicknamePolicy;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatAdminPresenceResponse;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatEnvelope;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatPresenceEntry;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatPresenceResponse;
import com.dawne.com2usbaseball.domain.chat.enums.ChatPresenceKind;
import com.dawne.com2usbaseball.domain.chat.repository.ChatRepository;
import com.dawne.com2usbaseball.domain.chat.service.support.ChatBadgeReader;
import com.dawne.com2usbaseball.domain.chat.service.support.ChatGuestPrincipal;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/** 접속자(STOMP 연결) 기록·집계. Valkey 만 쓴다(닉네임 조회만 DB). */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatPresenceService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final ChatBadgeReader badgeReader;
    private final ObjectMapper objectMapper;

    /** 로그인 Principal 이면 userId, 아니면 null */
    public static Long userIdOf(Principal principal) {
        if (principal instanceof Authentication a && a.getPrincipal() instanceof Long id) {
            return id;
        }
        return null;
    }

    /** 닉네임 null 이거나 *** 로 끝나면 미설정 (ChatService.send 와 같은 기준) */
    public static boolean isNicknameSet(String nickname) {
        return NicknamePolicy.isSet(nickname);
    }

    public ChatPresenceEntry resolveEntry(Principal principal) {
        Long userId = userIdOf(principal);
        if (userId != null) {
            UserEntity user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                ChatPresenceKind kind = isNicknameSet(user.getNickname()) ? ChatPresenceKind.USER : ChatPresenceKind.UNNAMED;
                return new ChatPresenceEntry(kind, user.getNickname(), userId);
            }
        }
        if (principal instanceof ChatGuestPrincipal g) {
            return new ChatPresenceEntry(ChatPresenceKind.GUEST, g.getName(), null);
        }
        return new ChatPresenceEntry(ChatPresenceKind.GUEST, null, null);
    }

    public void connect(String sessionId, Principal principal) {
        chatRepository.putPresence(sessionId, toJson(resolveEntry(principal)));
        broadcast();
    }

    public void disconnect(String sessionId) {
        if (chatRepository.removePresence(sessionId)) {
            broadcast();
        }
    }

    /** 앱 시작 때 호출 — 서버가 죽어 끊김 이벤트를 못 받은 유령 접속자 정리 */
    public void clearAll() {
        chatRepository.clearPresence();
    }

    public ChatPresenceResponse getCount() {
        return new ChatPresenceResponse(countDistinct(readEntries()));
    }

    public ChatAdminPresenceResponse getAdminList() {
        Map<Long, ChatAdminPresenceResponse.User> users = new TreeMap<>();
        Set<String> guests = new TreeSet<>();
        int anonymous = 0;
        for (ChatPresenceEntry e : readEntries()) {
            if (e.kind() == ChatPresenceKind.GUEST) {
                if (e.name() == null) {
                    anonymous++;
                } else {
                    guests.add(e.name());
                }
            } else if (e.userId() != null) {
                boolean set = e.kind() == ChatPresenceKind.USER;
                users.computeIfAbsent(e.userId(), id -> new ChatAdminPresenceResponse.User(e.userId(), e.name(), set,
                        badgeReader.levelOf(e.userId()), badgeReader.titleOf(e.userId())));
            }
        }
        List<ChatAdminPresenceResponse.User> sorted = new ArrayList<>(users.values());
        sorted.sort(Comparator.comparing(ChatAdminPresenceResponse.User::nickname,
                Comparator.nullsLast(Comparator.<String>naturalOrder())));
        return new ChatAdminPresenceResponse(sorted, List.copyOf(guests), anonymous);
    }

    /** 로그인 = userId 기준 1명, 번호 게스트 = 이름 기준 1명, 번호 없는 게스트 = 연결마다 1명 */
    static int countDistinct(List<ChatPresenceEntry> entries) {
        Set<String> keys = new HashSet<>();
        int anonymous = 0;
        for (ChatPresenceEntry e : entries) {
            if (e.kind() != ChatPresenceKind.GUEST && e.userId() != null) {
                keys.add("u:" + e.userId());
            } else if (e.name() != null) {
                keys.add("g:" + e.name());
            } else {
                anonymous++;
            }
        }
        return keys.size() + anonymous;
    }

    private void broadcast() {
        chatRepository.publish(toJson(ChatEnvelope.presence(getCount())));
    }

    private List<ChatPresenceEntry> readEntries() {
        List<ChatPresenceEntry> result = new ArrayList<>();
        for (String json : chatRepository.findAllPresence()) {
            try {
                result.add(objectMapper.readValue(json, ChatPresenceEntry.class));
            } catch (JsonProcessingException e) {
                log.warn("chat: 깨진 접속자 항목 무시");
            }
        }
        return result;
    }

    private String toJson(Object o) {
        try {
            return objectMapper.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }
}
