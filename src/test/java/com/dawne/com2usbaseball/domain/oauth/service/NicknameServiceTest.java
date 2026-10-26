package com.dawne.com2usbaseball.domain.oauth.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.oauth.entity.UserEntity;
import com.dawne.com2usbaseball.domain.oauth.enums.UserStatus;
import com.dawne.com2usbaseball.domain.oauth.repository.UserRepository;
import com.dawne.com2usbaseball.domain.oauth.service.support.NicknamePolicy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class NicknameServiceTest {

    @Test
    @DisplayName("닉네임 미설정 판단 - null, 빈값, *** 끝은 미설정")
    void 닉네임_미설정_판단() {
        assertFalse(NicknamePolicy.isSet(null));
        assertFalse(NicknamePolicy.isSet(" "));
        assertFalse(NicknamePolicy.isSet("홍길***"));
        assertTrue(NicknamePolicy.isSet("홍길동"));
    }

    @Test
    @DisplayName("다른 사용자가 쓰는 닉네임으로 저장하면 409")
    void 중복_닉네임_저장_409() {
        UserRepository repo = mock(UserRepository.class);
        UserEntity user = new UserEntity();
        user.setUserStatus(UserStatus.ACTIVE);
        when(repo.findById(1L)).thenReturn(Optional.of(user));
        when(repo.existsNicknameExceptUser("홍길동", 1L)).thenReturn(true);
        UserServiceImpl service = new UserServiceImpl(repo, null, null, null, null);

        BaseException e = assertThrows(BaseException.class, () -> service.updateMe(1L, " 홍길동 ", null));
        assertEquals(HttpStatus.CONFLICT, e.getStatus());
        verify(repo, never()).updateNickname(any(), any());
    }

    @Test
    @DisplayName("*** 로 끝나는 닉네임은 중복 확인에서 400")
    void 별표_닉네임_400() {
        UserServiceImpl service = new UserServiceImpl(mock(UserRepository.class), null, null, null, null);
        BaseException e = assertThrows(BaseException.class, () -> service.isNicknameAvailable(1L, "abc***"));
        assertEquals(HttpStatus.BAD_REQUEST, e.getStatus());
    }
}
