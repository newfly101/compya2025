package com.dawne.com2usbaseball.domain.event.service.support;

import java.util.List;
import java.util.Optional;

/** 카페 내부 API 접근 (비로그인). 테스트에서는 가짜로 갈아 끼운다. */
public interface CafeClient {

    /** "진행 중 Event" 게시판 최신 글 목록 (작성자 거르기 전) */
    List<CafeArticleSummary> fetchList();

    /** 글 상세. 실패(네트워크·비정상 응답)는 빈 값이 아니라 예외로 알린다. */
    CafeArticle fetchArticle(long articleId);

    /** 이미지 원본 바이트. 허용 도메인이 아니거나 실패하면 빈 값. */
    Optional<byte[]> fetchImage(String url);
}
