package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.domain.community.dto.mapstruct.BoardMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.BoardRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.BoardResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardEntity;
import com.dawne.com2usbaseball.domain.community.service.board.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/boards")
public class AdminBoardController {

    private final BoardService boardService;
    private final BoardMapStruct boardMapStruct;

    @GetMapping
    public List<BoardResponse> getBoardList() {
        return boardService.getBoardList()
                .stream()
                .map(boardMapStruct::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public BoardResponse getBoardDetail(@PathVariable Long id) {
        return boardMapStruct.toResponse(boardService.getBoardDetail(id));
    }

    @PostMapping
    public Long createBoard(@RequestBody BoardRequest request) {
        BoardEntity entity = boardMapStruct.toEntity(request);
        return boardService.createBoard(entity);
    }

    @PutMapping("/{id}")
    public void updateBoard(@PathVariable Long id,
                            @RequestBody BoardRequest request) {
        BoardEntity entity = boardMapStruct.toEntity(request);
        boardService.updateBoard(id, entity);
    }

    @PatchMapping("/{id}/visible")
    public void updateBoardVisible(@PathVariable Long id,
                                   @RequestParam Boolean isVisible) {
        boardService.updateBoardVisible(id, isVisible);
    }

    @DeleteMapping("/{id}")
    public void deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
    }
}
