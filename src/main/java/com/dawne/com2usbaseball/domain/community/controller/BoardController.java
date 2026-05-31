package com.dawne.com2usbaseball.domain.community.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.community.dto.mapstruct.BoardMapStruct;
import com.dawne.com2usbaseball.domain.community.dto.response.BoardResponse;
import com.dawne.com2usbaseball.domain.community.enums.messages.CommunityMessages;
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
    public GlobalResponse<List<BoardResponse>> getVisibleBoardList() {
        List<BoardResponse> items = boardService.getVisibleBoardList()
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

    @GetMapping("/code/{code}")
    public GlobalResponse<BoardResponse> getBoardDetailByCode(@PathVariable String code) {
        BoardResponse item = boardMapStruct.toResponse(boardService.getBoardDetailByCode(code));
        return GlobalResponse.success(CommunityMessages.COMMUNITY_BOARD_DETAIL_SUCCESS, item);
    }
}
