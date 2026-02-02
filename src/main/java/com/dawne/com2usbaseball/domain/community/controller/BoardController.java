package com.dawne.com2usbaseball.domain.community.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/community/boards")
public class BoardController {

    // 게시판 정보 조회
    // GET /boards/{boardCode}
    @GetMapping("/{boardCode}")
    public void getBoardsList(@PathVariable("boardCode") String boardCode) {

    }

    // 게시글 목록 조회
    // GET /boards/{boardCode}/posts
    @GetMapping("/{boardCode}/posts")
    public void getPostsList(@PathVariable("boardCode") String boardCode) {

    }
}
