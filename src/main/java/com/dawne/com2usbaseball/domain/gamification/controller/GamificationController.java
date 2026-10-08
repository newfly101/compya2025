package com.dawne.com2usbaseball.domain.gamification.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.gamification.dto.request.EquipTitleRequest;
import com.dawne.com2usbaseball.domain.gamification.dto.response.*;
import com.dawne.com2usbaseball.domain.gamification.enums.GamificationMessages;
import com.dawne.com2usbaseball.domain.gamification.service.GamificationService;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** 등급·칭호·포인트 — 전부 로그인 필요. 서버는 로그인한 본인 기록만 읽고 쓴다. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/gamification")
public class GamificationController {

    private final GamificationService gamificationService;

    @PostMapping("/check-in")
    public GlobalResponse<CheckInResponse> checkIn(HttpServletRequest http) {
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_CHECKED_IN,
                gamificationService.checkIn(requireUserId(http)));
    }

    @GetMapping("/me")
    public GlobalResponse<GamificationMeResponse> me(HttpServletRequest http) {
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_SUCCESS,
                gamificationService.getMe(requireUserId(http)));
    }

    @GetMapping("/titles")
    public GlobalResponse<List<TitleDefResponse>> titles(HttpServletRequest http) {
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_SUCCESS,
                gamificationService.getTitles(requireUserId(http)));
    }

    @GetMapping("/levels")
    public GlobalResponse<List<LevelItemResponse>> levels(HttpServletRequest http) {
        requireUserId(http);
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_SUCCESS, gamificationService.getLevels());
    }

    @GetMapping("/me/history")
    public GlobalResponse<LedgerHistoryResponse> history(@RequestParam String type,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         HttpServletRequest http) {
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_LEDGER_SUCCESS,
                gamificationService.getHistory(requireUserId(http), type, page));
    }

    @PutMapping("/me/title")
    public GlobalResponse<GamificationMeResponse> equipTitle(@RequestBody EquipTitleRequest request,
                                                             HttpServletRequest http) {
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_TITLE_EQUIPPED,
                gamificationService.equipTitle(requireUserId(http), request.code()));
    }

    private Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }
}
