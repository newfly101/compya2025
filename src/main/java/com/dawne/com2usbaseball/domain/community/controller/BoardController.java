package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.domain.community.dto.mapstruct.BoardMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.response.BoardResponse;
import com.dawne.com2usbaseball.domain.community.service.board.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;
    private final BoardMapStruct boardMapStruct;

    @GetMapping
    public List<BoardResponse> getVisibleBoardList() {
        return boardService.getVisibleBoardList()
                .stream()
                .map(boardMapStruct::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public BoardResponse getBoardDetail(@PathVariable Long id) {
        return boardMapStruct.toResponse(boardService.getBoardDetail(id));
    }

    @GetMapping("/code/{code}")
    public BoardResponse getBoardDetailByCode(@PathVariable String code) {
        return boardMapStruct.toResponse(boardService.getBoardDetailByCode(code));
    }
}
