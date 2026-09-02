package com.dawne.com2usbaseball.domain.fun.legendStat.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.fun.legendStat.dto.LegendStatSnapshot;
import com.dawne.com2usbaseball.domain.fun.legendStat.enums.FunLegendStatMessages;
import com.dawne.com2usbaseball.domain.fun.legendStat.service.FunLegendStatService;
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
 * 레전드 태생 스탯 조회 API. 조회 전용.
 * 재료는 여기서 다루지 않는다 — 이름을 눌렀을 때 GET /api/legends/{id} 를 부른다.
 *
 * 거의 바뀌지 않는 데이터라 캐시를 세 겹으로 둔다.
 *   @Cacheable(서버) / ETag(304) / Cache-Control(브라우저)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/legend-stats")
public class FunLegendStatController {

    private static final Duration MAX_AGE = Duration.ofHours(1);

    private final FunLegendStatService funLegendStatService;

    @GetMapping
    public ResponseEntity<GlobalResponse<?>> getAll(WebRequest request) {
        return respond(request, funLegendStatService.getAll(),
                FunLegendStatMessages.FUN_LEGEND_STAT_LIST_SUCCESS);
    }

    @GetMapping("/pitch-types")
    public ResponseEntity<GlobalResponse<?>> getPitchTypes(WebRequest request) {
        return respond(request, funLegendStatService.getPitchTypes(),
                FunLegendStatMessages.FUN_PITCH_TYPE_LIST_SUCCESS);
    }

    /**
     * ETag 헤더는 checkNotModified 가 직접 써 준다(따옴표도 알아서 붙인다).
     * ResponseEntity.eTag() 로 또 붙이면 헤더가 두 벌이 되므로 쓰지 않는다.
     */
    private ResponseEntity<GlobalResponse<?>> respond(WebRequest request,
                                                      LegendStatSnapshot<?> snapshot,
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
