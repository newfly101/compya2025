package com.dawne.com2usbaseball.domain.fun.playerCard.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardCreateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardUpdateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.FunPlayerCardResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.enums.FunPlayerCardMessages;
import com.dawne.com2usbaseball.domain.fun.playerCard.service.FunPlayerCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController("AdminPlayerCardControllerV2")
@RequiredArgsConstructor
@RequestMapping("/api/admin/player-cards")
public class FunAdminPlayerCardController {

    private final FunPlayerCardService funPlayerCardService;

    @PostMapping
    public GlobalResponse<Long> create(@RequestBody FunPlayerCardCreateRequest request) {
        Long id = funPlayerCardService.create(request);
        return GlobalResponse.success(FunPlayerCardMessages.FUN_PLAYER_CARD_CREATED, id);
    }

    @PutMapping("/{id}")
    public GlobalResponse<Void> update(@PathVariable Long id,
                                       @RequestBody FunPlayerCardUpdateRequest request) {
        funPlayerCardService.update(id, request);
        return GlobalResponse.success(FunPlayerCardMessages.FUN_PLAYER_CARD_UPDATED, null);
    }

    @GetMapping("/{id}")
    public GlobalResponse<FunPlayerCardResponse> get(@PathVariable Long id) {
        FunPlayerCardResponse item = funPlayerCardService.getById(id);
        return GlobalResponse.success(FunPlayerCardMessages.FUN_PLAYER_CARD_DETAIL_SUCCESS, item);
    }
}
