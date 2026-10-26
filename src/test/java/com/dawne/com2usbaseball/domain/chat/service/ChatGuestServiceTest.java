package com.dawne.com2usbaseball.domain.chat.service;

import com.dawne.com2usbaseball.domain.chat.repository.ChatRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ChatGuestServiceTest {

    private ChatRepository repo;

    @BeforeEach
    void setUp() {
        repo = mock(ChatRepository.class);
    }

    @Test
    @DisplayName("번호 형식은 guest + 5자리 0채움")
    void 번호_형식() {
        assertEquals("guest00042", ChatGuestService.format(42));
        assertEquals("guest99999", ChatGuestService.format(99999));
    }

    @Test
    @DisplayName("이미 쓰는 번호면 다른 번호로 재시도해 예약한다")
    void 예약_재시도() {
        AtomicInteger seq = new AtomicInteger(0);
        ChatGuestService service = new ChatGuestService(repo, seq::incrementAndGet);
        when(repo.reserveGuestNumber(eq1(1), anyString())).thenReturn(false);
        when(repo.reserveGuestNumber(eq1(2), anyString())).thenReturn(false);
        when(repo.reserveGuestNumber(eq1(3), anyString())).thenReturn(true);

        ChatGuestService.Issued issued = service.issue(null);

        assertEquals("guest00003", issued.name());
        assertNotNull(issued.token());
        verify(repo).saveGuestToken(issued.token(), 3);
        verify(repo, times(3)).reserveGuestNumber(anyInt(), anyString());
    }

    @Test
    @DisplayName("20번 모두 실패하면 번호 없는 게스트(name null, 쿠키 없음)")
    void 예약_전부_실패() {
        ChatGuestService service = new ChatGuestService(repo, () -> 7);
        when(repo.reserveGuestNumber(anyInt(), anyString())).thenReturn(false);

        ChatGuestService.Issued issued = service.issue(null);

        assertNull(issued.name());
        assertNull(issued.token());
        verify(repo, times(ChatGuestService.MAX_ATTEMPTS)).reserveGuestNumber(anyInt(), anyString());
        verify(repo, never()).saveGuestToken(anyString(), anyInt());
    }

    @Test
    @DisplayName("유효한 토큰이면 같은 번호를 돌려주고 TTL 만 갱신, 새 예약 없음")
    void 같은_토큰_같은_번호() {
        ChatGuestService service = new ChatGuestService(repo, () -> 1);
        when(repo.findGuestNumber("tok")).thenReturn(42);

        ChatGuestService.Issued issued = service.issue("tok");

        assertEquals("guest00042", issued.name());
        assertEquals("tok", issued.token());
        verify(repo).renewGuest("tok", 42);
        verify(repo, never()).reserveGuestNumber(anyInt(), anyString());
    }

    @Test
    @DisplayName("만료된 토큰이면 새로 발급")
    void 만료_토큰_새_발급() {
        ChatGuestService service = new ChatGuestService(repo, () -> 5);
        when(repo.findGuestNumber("old")).thenReturn(null);
        when(repo.reserveGuestNumber(anyInt(), anyString())).thenReturn(true);

        ChatGuestService.Issued issued = service.issue("old");

        assertEquals("guest00005", issued.name());
        assertNotEquals("old", issued.token());
    }

    @Test
    @DisplayName("Valkey 오류는 삼키고 번호 없는 게스트로 응답")
    void valkey_오류() {
        ChatGuestService service = new ChatGuestService(repo, () -> 1);
        when(repo.reserveGuestNumber(anyInt(), anyString())).thenThrow(new IllegalStateException("down"));

        assertNull(service.issue(null).name());
        when(repo.findGuestNumber("t")).thenThrow(new IllegalStateException("down"));
        assertNull(service.findName("t"));
    }

    private static int eq1(int v) {
        return org.mockito.ArgumentMatchers.eq(v);
    }
}
