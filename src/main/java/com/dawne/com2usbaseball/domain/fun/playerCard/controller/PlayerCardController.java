package com.dawne.com2usbaseball.domain.fun.playerCard.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.fun.playerCard.dto.PlayerCardSnapshot;
import com.dawne.com2usbaseball.domain.fun.playerCard.enums.PlayerCardMessages;
import com.dawne.com2usbaseball.domain.fun.playerCard.service.PlayerCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.WebRequest;

import java.time.Duration;

/**
 * 선수 백과사전 카드 목록 조회 API. 조회 전용. 등록·수정·삭제는 여기서 다루지 않는다.
 *
 * 11,668건이 한 응답에 실리고 거의 바뀌지 않는 데이터라 캐시를 세 겹으로 둔다.
 *   @Cacheable(서버) / ETag(304) / Cache-Control(브라우저)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/player-cards")
public class PlayerCardController {

    private static final Duration MAX_AGE = Duration.ofHours(1);

    private final PlayerCardService playerCardService;

    @GetMapping
    public ResponseEntity<GlobalResponse<?>> getAll(WebRequest request) {
        return respond(request, playerCardService.getAll(),
                PlayerCardMessages.PLAYER_CARD_LIST_SUCCESS);
    }

    /**
     * 구단 하나(전체 연도)의 스탯 + 구종 전량. 사용자가 구단을 고를 때 한 번만 부르고,
     * 연도·포지션 전환은 화면이 이미 받은 데이터에서 거른다(서버를 다시 부르지 않는다).
     */
    @GetMapping("/{teamCode}/stats")
    public ResponseEntity<GlobalResponse<?>> getStatsByTeam(@PathVariable String teamCode, WebRequest request) {
        return respond(request, playerCardService.getStatsByTeam(teamCode),
                PlayerCardMessages.PLAYER_CARD_STAT_LIST_SUCCESS);
    }

    /**
     * ETag 헤더는 checkNotModified 가 직접 써 준다(따옴표도 알아서 붙인다).
     * ResponseEntity.eTag() 로 또 붙이면 헤더가 두 벌이 되므로 쓰지 않는다.
     */
    private ResponseEntity<GlobalResponse<?>> respond(WebRequest request,
                                                        PlayerCardSnapshot<?> snapshot,
                                                        Enum<?> message) {
        CacheControl cacheControl = CacheControl.maxAge(MAX_AGE).cachePublic();

        if (request.checkNotModified(snapshot.etag())) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED).cacheControl(cacheControl).build();
        }
        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .body(GlobalResponse.success(message, snapshot.items()));
    }
}
