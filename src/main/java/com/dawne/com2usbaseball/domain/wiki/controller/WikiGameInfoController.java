package com.dawne.com2usbaseball.domain.wiki.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.wiki.dto.response.WikiGameInfoResponse;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiMessages;
import com.dawne.com2usbaseball.domain.wiki.enums.WikiTarget;
import com.dawne.com2usbaseball.domain.wiki.service.WikiGameInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wiki")
public class WikiGameInfoController {

    private final WikiGameInfoService wikiGameInfoService;

    @GetMapping("/game-info/{target}")
    public GlobalResponse<WikiGameInfoResponse> getGameInfo(@PathVariable WikiTarget target) {
        WikiGameInfoResponse response = wikiGameInfoService.getGameInfo(target);
        return GlobalResponse.success(WikiMessages.WIKI_GAME_INFO_SUCCESS, response);
    }
}
