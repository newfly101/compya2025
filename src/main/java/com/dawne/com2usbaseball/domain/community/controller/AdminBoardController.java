package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.BoardMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.request.BoardRequest;
import com.dawne.com2usbaseball.domain.community.dto.response.BoardResponse;
import com.dawne.com2usbaseball.domain.community.entity.BoardEntity;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
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
    public GlobalResponse<List<BoardResponse>> getBoardList() {
        List<BoardResponse> items = boardService.getBoardList()
                .stream()
                .map(boardMapStruct::toResponse)
                .toList();
        return GlobalResponse.success(CommunityMessages.COMMUNITY_BOARD_LIST_SUCCESS, items);
    }

    @GetMapping("/{id}")
    public GlobalResponse<BoardResponse> getBoardDetail(@PathVariable Long id) {
        BoardResponse item = boardMapStruct.toResponse(boardService.getBoardDetail(id));
        return GlobalResponse.success(CommunityMessages.COMMUNITY_BOARD_DETAIL_SUCCESS, item);
    }

    @PostMapping
    public GlobalResponse<Long> createBoard(@RequestBody BoardRequest request) {
        BoardEntity entity = boardMapStruct.toEntity(request);
        Long id = boardService.createBoard(entity);
        return GlobalResponse.success(CommunityMessages.COMMUNITY_BOARD_CREATED, id);
    }

    @PutMapping("/{id}")
    public GlobalResponse<Void> updateBoard(@PathVariable Long id,
                                            @RequestBody BoardRequest request) {
        BoardEntity entity = boardMapStruct.toEntity(request);
        boardService.updateBoard(id, entity);
        return GlobalResponse.success(CommunityMessages.COMMUNITY_BOARD_UPDATED, null);
    }

    @PatchMapping("/{id}/visible")
    public GlobalResponse<Void> updateBoardVisible(@PathVariable Long id,
                                                   @RequestParam Boolean isVisible) {
        boardService.updateBoardVisible(id, isVisible);
        return GlobalResponse.success(CommunityMessages.COMMUNITY_BOARD_VISIBLE_UPDATED, null);
    }

    @DeleteMapping("/{id}")
    public GlobalResponse<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return GlobalResponse.success(CommunityMessages.COMMUNITY_BOARD_DELETED, null);
    }
}
