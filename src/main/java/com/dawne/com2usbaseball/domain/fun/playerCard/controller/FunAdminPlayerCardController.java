package com.dawne.com2usbaseball.domain.fun.playerCard.controller;

import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardCreateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.request.FunPlayerCardUpdateRequest;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.response.FunPlayerCardResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.service.FunPlayerCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController("AdminPlayerCardControllerV2")
@RequiredArgsConstructor
@RequestMapping("/api/admin/player-cards")
public class FunAdminPlayerCardController {

    private final FunPlayerCardService funPlayerCardService;

    @PostMapping
    public Long create(@RequestBody FunPlayerCardCreateRequest request) {
        return funPlayerCardService.create(request);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id,
                       @RequestBody FunPlayerCardUpdateRequest request) {
        funPlayerCardService.update(id, request);
    }

    @GetMapping("/{id}")
    public FunPlayerCardResponse get(@PathVariable Long id) {
        return funPlayerCardService.getById(id);
    }
}
