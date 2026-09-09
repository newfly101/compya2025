package com.dawne.com2usbaseball.domain.fun.playerSkill.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.fun.playerSkill.dto.PlayerSkillSnapshot;
import com.dawne.com2usbaseball.domain.fun.playerSkill.enums.PlayerSkillMessages;
import com.dawne.com2usbaseball.domain.fun.playerSkill.service.PlayerSkillService;
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
 * 선수 스킬 백과사전 조회 API. 조회 전용 — 등록·수정·삭제는 없다.
 * 타자/투수 각 46건을 목록에 전부 담는다 (상세 API 로 나누지 않음 — gzip 기준 2.7KB 수준이라 이득이 없음).
 *
 * 거의 바뀌지 않는 데이터라 캐시를 세 겹으로 둔다.
 *   @Cacheable(서버) / ETag(304) / Cache-Control(브라우저)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/player-skills")
public class PlayerSkillController {

    private static final Duration MAX_AGE = Duration.ofHours(1);

    private final PlayerSkillService playerSkillService;

    @GetMapping("/hitters")
    public ResponseEntity<GlobalResponse<?>> getHitterSkills(WebRequest request) {
        return respond(request, playerSkillService.getHitterSkills(),
                PlayerSkillMessages.PLAYER_SKILL_HITTER_LIST_SUCCESS);
    }

    @GetMapping("/pitchers")
    public ResponseEntity<GlobalResponse<?>> getPitcherSkills(WebRequest request) {
        return respond(request, playerSkillService.getPitcherSkills(),
                PlayerSkillMessages.PLAYER_SKILL_PITCHER_LIST_SUCCESS);
    }

    /**
     * ETag 헤더는 checkNotModified 가 직접 써 준다(따옴표도 알아서 붙인다).
     * ResponseEntity.eTag() 로 또 붙이면 헤더가 두 벌이 되므로 쓰지 않는다.
     */
    private ResponseEntity<GlobalResponse<?>> respond(WebRequest request,
                                                        PlayerSkillSnapshot<?> snapshot,
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
