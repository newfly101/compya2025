package com.dawne.com2usbaseball.domain.event.service.support;

import java.time.LocalDateTime;

/** 카페 게시판 목록의 글 한 줄 */
public record CafeArticleSummary(long articleId, String subject, String memberKey, LocalDateTime writtenAt) { }
