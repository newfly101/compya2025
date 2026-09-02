package com.dawne.com2usbaseball.domain.fun.historyMode.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.fun.historyMode.dto.HistoryRoundSnapshot;
import com.dawne.com2usbaseball.domain.fun.historyMode.enums.FunHistoryModeMessages;
import com.dawne.com2usbaseball.domain.fun.historyMode.service.FunHistoryModeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import java.time.Duration;

/**
 * 히스토리 모드 라운드 조회 API. 조회 전용.
 * data_history_round / data_history_roster 에 대응하고, 재료 여부는
 * data_player_legend_material 조인으로 판정해 legendName 으로 내린다.
 *
 * 값이 거의 바뀌지 않아 캐시를 세 겹으로 둔다 — @Cacheable / ETag / Cache-Control.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/history-rounds")
public class FunHistoryModeController {

    private static final Duration MAX_AGE = Duration.ofHours(1);

    private final FunHistoryModeService funHistoryModeService;

    /** 라운드 70개 + 25인 로스터 전량. 재료만 추리지 않는다 — 덱빌딩도 이 응답을 쓴다. */
    @GetMapping
    public ResponseEntity<GlobalResponse<?>> getAll(WebRequest request) {
        HistoryRoundSnapshot<?> snapshot = funHistoryModeService.getAllRounds();
        CacheControl cacheControl = CacheControl.maxAge(MAX_AGE).cachePublic();

        // ETag 헤더는 checkNotModified 가 직접 써 준다
        if (request.checkNotModified(snapshot.etag())) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).cacheControl(cacheControl).build();
        }
        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .body(GlobalResponse.success(FunHistoryModeMessages.FUN_HISTORY_ROUND_LIST_SUCCESS,
                        snapshot.items()));
    }
}
