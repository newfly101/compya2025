package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.domain.community.dto.request.BoardCreateRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.BoardListResponse;
import com.dawne.com2usbaseball.domain.community.dto.response.InsertBoardResponse;
import com.dawne.com2usbaseball.domain.community.service.board.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/community")
public class BoardController {

    private final BoardService boardService;

    @GetMapping("/admin/boards")
    public BoardListResponse getBoardsList() {
        return boardService.selectBoardList();
    }
    @PostMapping("/admin/boards")
    public InsertBoardResponse createNewBoard(@RequestBody BoardCreateRequest request) {
        return boardService.createNewBoardItem(request.toEntity());
    }


    // 게시판 정보 조회
    // GET /boards/{boardCode}
//    @GetMapping("/{boardCode}")
//    public BoardResponse getBoardsList(@PathVariable("boardCode") String boardCode) {
//        return boardService.selectBoardList(boardCode);
//    }

    // 게시글 목록 조회
    // GET /boards/{boardCode}/posts
//    @GetMapping("/{boardCode}/posts")
//    public void getPostsList(@PathVariable("boardCode") String boardCode) {
//        boardService.selectPostList(boardCode);
//    }
}
