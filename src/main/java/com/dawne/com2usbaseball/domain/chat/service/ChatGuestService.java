package com.dawne.com2usbaseball.domain.chat.service;

import com.dawne.com2usbaseball.domain.chat.repository.ChatRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.IntSupplier;

/** 게스트 번호(guest00000~guest99999) 발급. 같은 토큰(쿠키)이면 24시간 같은 번호, 동시에 같은 번호 두 명 금지. */
@Slf4j
@Service
public class ChatGuestService {

    public static final int MAX_ATTEMPTS = 20;
    public static final int NUMBER_BOUND = 100_000;

    /** token 은 쿠키에 (다시) 심을 값, 번호를 못 받았으면 둘 다 null */
    public record Issued(String token, String name) {
    }

    private final ChatRepository chatRepository;
    private final IntSupplier randomNumber;

    @Autowired
    public ChatGuestService(ChatRepository chatRepository) {
        this(chatRepository, () -> ThreadLocalRandom.current().nextInt(NUMBER_BOUND));
    }

    ChatGuestService(ChatRepository chatRepository, IntSupplier randomNumber) {
        this.chatRepository = chatRepository;
        this.randomNumber = randomNumber;
    }

    public static String format(int number) {
        return String.format("guest%05d", number);
    }

    /** 유효한 토큰이면 같은 번호 + TTL 갱신, 아니면 새로 발급. Valkey 오류는 번호 없는 게스트로 처리. */
    public Issued issue(String cookieToken) {
        try {
            if (cookieToken != null && !cookieToken.isBlank()) {
                Integer existing = chatRepository.findGuestNumber(cookieToken);
                if (existing != null) {
                    chatRepository.renewGuest(cookieToken, existing);
                    return new Issued(cookieToken, format(existing));
                }
            }
            String token = UUID.randomUUID().toString();
            for (int i = 0; i < MAX_ATTEMPTS; i++) {
                int n = randomNumber.getAsInt();
                if (chatRepository.reserveGuestNumber(n, token)) {
                    chatRepository.saveGuestToken(token, n);
                    return new Issued(token, format(n));
                }
            }
            log.warn("chat: 게스트 번호 예약 {}회 실패 — 번호 없는 게스트로 응답", MAX_ATTEMPTS);
        } catch (Exception e) {
            log.error("chat: 게스트 번호 발급 실패 — 번호 없는 게스트로 응답", e);
        }
        return new Issued(null, null);
    }

    /** 웹소켓 연결용 조회(갱신 없음). 없거나 Valkey 오류면 null */
    public String findName(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            Integer n = chatRepository.findGuestNumber(token);
            return n == null ? null : format(n);
        } catch (Exception e) {
            log.warn("chat: 게스트 조회 실패 — 번호 없는 게스트로 연결", e);
            return null;
        }
    }
}
