package com.dawne.com2usbaseball.domain.player.controller;

import com.dawne.com2usbaseball.domain.player.dto.response.PlayerCardResponse;
import com.dawne.com2usbaseball.common.enums.Target;
import com.dawne.com2usbaseball.domain.player.service.PlayerCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/player")
public class PlayerCardController {
    private final PlayerCardService service;

    @GetMapping("/{position}")
    public List<PlayerCardResponse> getLegendPlayerByPosition(@PathVariable Target position) {
        return service.getPlayerInfo(position);
    }
}
