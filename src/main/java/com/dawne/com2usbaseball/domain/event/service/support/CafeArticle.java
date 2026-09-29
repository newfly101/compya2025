package com.dawne.com2usbaseball.domain.event.service.support;

import java.time.LocalDateTime;

/** 카페 글 상세 (본문 HTML 포함) */
public record CafeArticle(long articleId, String subject, String memberKey, LocalDateTime writtenAt, String contentHtml) { }
