package com.dawne.com2usbaseball.domain.gamification.dto.response;

import java.time.LocalDateTime;

/** 운영자 화면용 — 칭호 정의 한 건 + 대상 유저 보유 여부. */
public record AdminTitleResponse(String code, String name, String category, int bonusPoint,
                                 boolean owned, boolean equipped, LocalDateTime grantedAt) {
}
