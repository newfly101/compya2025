package com.dawne.com2usbaseball.domain.chat.dto.response;

import java.util.List;

/** 관리자 전용 접속 목록 */
public record ChatAdminPresenceResponse(List<User> users, List<String> guests, int anonymousCount) {

    /** nicknameSet=false 면 닉네임 미설정(nickname 은 null 일 수 있다) */
    public record User(Long userId, String nickname, boolean nicknameSet) {
    }
}
