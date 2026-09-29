package com.dawne.com2usbaseball.domain.event.service.support;

import java.time.LocalDateTime;

/** 제목에서 읽은 이벤트 이름·마감. expireAt 이 null 이면 제목에 마감이 없다. */
public record CafeTitle(String name, LocalDateTime expireAt) { }
