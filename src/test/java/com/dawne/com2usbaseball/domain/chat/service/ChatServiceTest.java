package com.dawne.com2usbaseball.domain.chat.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatEnvelope;
import com.dawne.com2usbaseball.domain.chat.dto.response.ChatMessageResponse;
import com.dawne.com2usbaseball.domain.chat.enums.ChatMessages;
import com.dawne.com2usbaseball.domain.chat.repository.ChatRepository;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ChatServiceTest {

    private final ObjectMapper om = new ObjectMapper();
    private ChatRepository repo;
    private UserRepository users;
    private ChatService service;

    @BeforeEach
    void setUp() {
        repo = mock(ChatRepository.class);
        users = mock(UserRepository.class);
        service = new ChatService(repo, users, om);
        when(repo.acquireRateLimit(anyLong())).thenReturn(true);
        when(users.findById(1L)).thenReturn(Optional.of(UserEntity.builder().id(1L).nickname("홍길동").build()));
    }

    private ChatMessages codeOf(Long userId, String body) {
        BaseException e = assertThrows(BaseException.class, () -> service.send(userId, body));
        return (ChatMessages) e.getCode();
    }

    @Test
    @DisplayName("익명은 CHAT_UNAUTHORIZED")
    void 익명_거절() {
        assertEquals(ChatMessages.CHAT_UNAUTHORIZED, codeOf(null, "안녕"));
    }

    @Test
    @DisplayName("닉네임이 *** 로 끝나면 CHAT_NICKNAME_REQUIRED")
    void 마스킹_닉네임_거절() {
        when(users.findById(2L)).thenReturn(Optional.of(UserEntity.builder().id(2L).nickname("김**" + "*").build()));
        assertEquals(ChatMessages.CHAT_NICKNAME_REQUIRED, codeOf(2L, "안녕"));
    }

    @Test
    @DisplayName("공백뿐이거나 200자 초과면 CHAT_TOO_LONG, 200자는 통과")
    void 길이_검증() {
        assertEquals(ChatMessages.CHAT_TOO_LONG, codeOf(1L, "   "));
        assertEquals(ChatMessages.CHAT_TOO_LONG, codeOf(1L, "가".repeat(201)));
        assertDoesNotThrow(() -> service.send(1L, "가".repeat(200)));
        verify(repo, times(1)).acquireRateLimit(1L); // 거절된 2건은 레이트리밋을 소모하지 않는다 (통과한 1건만)
    }

    @Test
    @DisplayName("HTML/마크업 태그가 든 본문은 CHAT_MARKUP_NOT_ALLOWED")
    void 마크업_거절() {
        for (String b : new String[]{"<style color=\"red\">감사합니다</style>", "<b>굵게", "<script>alert(1)", "끝 </div>", "<!-- x -->"}) {
            assertEquals(ChatMessages.CHAT_MARKUP_NOT_ALLOWED, codeOf(1L, b), b);
        }
        verify(repo, never()).acquireRateLimit(anyLong());
    }

    @Test
    @DisplayName("일반 문장의 꺾쇠는 통과")
    void 일반_꺾쇠_통과() {
        for (String b : new String[]{"<3 사랑해", "1 < 2", "a < b", "<<최고>>", "a->b"}) {
            assertDoesNotThrow(() -> service.send(1L, b), b);
        }
    }

    @Test
    @DisplayName("줄은 5줄까지, 6줄부터 CHAT_TOO_MANY_LINES")
    void 줄수_제한() {
        assertDoesNotThrow(() -> service.send(1L, "1\n2\n3\n4\n5"));
        assertDoesNotThrow(() -> service.send(1L, "1\r\n2\r\n3\r\n4\r\n5"));
        assertEquals(ChatMessages.CHAT_TOO_MANY_LINES, codeOf(1L, "1\n2\n3\n4\n5\n6"));
        assertEquals(ChatMessages.CHAT_TOO_MANY_LINES, codeOf(1L, "a\n\n\n\n\nb"));
    }

    @Test
    @DisplayName("3초 안 재전송은 CHAT_RATE_LIMITED")
    void 레이트리밋() {
        when(repo.acquireRateLimit(1L)).thenReturn(false);
        assertEquals(ChatMessages.CHAT_RATE_LIMITED, codeOf(1L, "안녕"));
        verify(repo, never()).push(anyString());
    }

    @Test
    @DisplayName("성공 시 앞뒤 공백 제거·원문 저장 후 MESSAGE envelope 발행, 사용자 id 미노출")
    void 성공_저장과_발행() throws Exception {
        service.send(1L, "  안녕  ");
        ArgumentCaptor<String> pushed = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> published = ArgumentCaptor.forClass(String.class);
        verify(repo).push(pushed.capture());
        verify(repo).publish(published.capture());

        ChatMessageResponse m = om.readValue(pushed.getValue(), ChatMessageResponse.class);
        assertEquals("안녕", m.body());
        assertEquals("USER", m.senderType());
        assertEquals("홍길동", m.nickname());
        assertFalse(pushed.getValue().contains("userId"));
        assertTrue(published.getValue().startsWith("{\"type\":\"MESSAGE\",\"message\":{\"id\":\""));
    }

    @Test
    @DisplayName("DELETE envelope 는 type 과 id 만 직렬화")
    void 삭제_envelope_직렬화() throws Exception {
        assertEquals("{\"type\":\"DELETE\",\"id\":\"abc\"}", om.writeValueAsString(ChatEnvelope.delete("abc")));
    }

    @Test
    @DisplayName("관리자 삭제: 해당 id 항목만 LREM 하고 DELETE 발행, 없으면 404 코드")
    void 관리자_삭제() throws Exception {
        String a = om.writeValueAsString(new ChatMessageResponse("a", "USER", "n", "x", "t"));
        String b = om.writeValueAsString(new ChatMessageResponse("b", "USER", "n", "y", "t"));
        when(repo.findAll()).thenReturn(List.of(a, b));

        service.delete("b");
        verify(repo).remove(b);
        verify(repo).publish("{\"type\":\"DELETE\",\"id\":\"b\"}");

        BaseException e = assertThrows(BaseException.class, () -> service.delete("zzz"));
        assertEquals(ChatMessages.CHAT_MESSAGE_NOT_FOUND, e.getCode());
    }
}
