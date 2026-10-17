package com.dawne.com2usbaseball.domain.chat.service;

import com.dawne.com2usbaseball.domain.chat.dto.response.ChatAdminPresenceResponse;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatPresenceEntry;
import com.dawne.com2usbaseball.domain.chat.enums.ChatPresenceKind;
import com.dawne.com2usbaseball.domain.chat.repository.ChatRepository;
import com.dawne.com2usbaseball.domain.chat.service.support.ChatGuestPrincipal;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ChatPresenceServiceTest {

    private final ObjectMapper om = new ObjectMapper();
    private ChatRepository repo;
    private UserRepository users;
    private ChatPresenceService service;

    @BeforeEach
    void setUp() {
        repo = mock(ChatRepository.class);
        users = mock(UserRepository.class);
        service = new ChatPresenceService(repo, users, om);
        when(users.findById(1L)).thenReturn(Optional.of(UserEntity.builder().id(1L).nickname("홍길동").build()));
        when(users.findById(2L)).thenReturn(Optional.of(UserEntity.builder().id(2L).nickname("김**" + "*").build()));
        when(users.findById(3L)).thenReturn(Optional.of(UserEntity.builder().id(3L).nickname(null).build()));
    }

    private static UsernamePasswordAuthenticationToken login(long id) {
        return new UsernamePasswordAuthenticationToken(id, null, List.of());
    }

    @Test
    @DisplayName("kind 판정: 정상 닉네임 USER, null/*** UNNAMED, 게스트 GUEST")
    void kind_판정() {
        assertEquals(ChatPresenceKind.USER, service.resolveEntry(login(1)).kind());
        assertEquals(ChatPresenceKind.UNNAMED, service.resolveEntry(login(2)).kind());
        assertEquals(ChatPresenceKind.UNNAMED, service.resolveEntry(login(3)).kind());
        ChatPresenceEntry g = service.resolveEntry(new ChatGuestPrincipal("guest00042"));
        assertEquals(ChatPresenceKind.GUEST, g.kind());
        assertEquals("guest00042", g.name());
        assertNull(g.userId());
        ChatPresenceEntry anon = service.resolveEntry(null);
        assertEquals(ChatPresenceKind.GUEST, anon.kind());
        assertNull(anon.name());
    }

    @Test
    @DisplayName("접속 수: 같은 userId·같은 게스트 이름은 1명, 번호 없는 게스트는 연결마다 1명")
    void count_중복_제거() {
        List<ChatPresenceEntry> entries = List.of(
                new ChatPresenceEntry(ChatPresenceKind.USER, "홍길동", 1L),
                new ChatPresenceEntry(ChatPresenceKind.USER, "홍길동", 1L),
                new ChatPresenceEntry(ChatPresenceKind.UNNAMED, null, 3L),
                new ChatPresenceEntry(ChatPresenceKind.GUEST, "guest00042", null),
                new ChatPresenceEntry(ChatPresenceKind.GUEST, "guest00042", null),
                new ChatPresenceEntry(ChatPresenceKind.GUEST, null, null),
                new ChatPresenceEntry(ChatPresenceKind.GUEST, null, null));
        assertEquals(5, ChatPresenceService.countDistinct(entries));
    }

    @Test
    @DisplayName("연결 시 HSET 후 PRESENCE 방송, 공개 방송에는 이름·userId 가 없다")
    void 연결_방송() {
        service.connect("s1", login(1));
        verify(repo).putPresence(eq("s1"), anyString());
        var published = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(repo).publish(published.capture());
        assertEquals("{\"type\":\"PRESENCE\",\"presence\":{\"count\":0}}", published.getValue()); // repo mock 이라 목록이 비어 있다
        assertFalse(published.getValue().contains("홍길동"));
    }

    @Test
    @DisplayName("끊김: 실제로 지워졌을 때만 방송 (두 번 와도 한 번)")
    void 끊김_한번만_방송() {
        when(repo.removePresence("s1")).thenReturn(true, false);
        service.disconnect("s1");
        service.disconnect("s1");
        verify(repo, times(1)).publish(anyString());
    }

    @Test
    @DisplayName("관리자 목록: 로그인은 userId 중복 제거·닉네임 가나다순, 미설정 표시, 게스트 정렬, 번호 없음 수")
    void 관리자_목록() throws Exception {
        when(repo.findAllPresence()).thenReturn(List.of(
                om.writeValueAsString(new ChatPresenceEntry(ChatPresenceKind.USER, "홍길동", 1L)),
                om.writeValueAsString(new ChatPresenceEntry(ChatPresenceKind.USER, "홍길동", 1L)),
                om.writeValueAsString(new ChatPresenceEntry(ChatPresenceKind.USER, "가나다", 5L)),
                om.writeValueAsString(new ChatPresenceEntry(ChatPresenceKind.UNNAMED, null, 3L)),
                om.writeValueAsString(new ChatPresenceEntry(ChatPresenceKind.GUEST, "guest00050", null)),
                om.writeValueAsString(new ChatPresenceEntry(ChatPresenceKind.GUEST, "guest00007", null)),
                om.writeValueAsString(new ChatPresenceEntry(ChatPresenceKind.GUEST, "guest00007", null)),
                om.writeValueAsString(new ChatPresenceEntry(ChatPresenceKind.GUEST, null, null))));

        ChatAdminPresenceResponse r = service.getAdminList();

        assertEquals(3, r.users().size());
        assertEquals("가나다", r.users().get(0).nickname());
        assertEquals("홍길동", r.users().get(1).nickname());
        assertFalse(r.users().get(2).nicknameSet()); // 미설정은 맨 뒤
        assertEquals(List.of("guest00007", "guest00050"), r.guests());
        assertEquals(1, r.anonymousCount());
    }
}
