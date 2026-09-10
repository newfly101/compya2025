package com.dawne.com2usbaseball.domain.fun.mileage.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.fun.mileage.dto.MileageSnapshot;
import com.dawne.com2usbaseball.domain.fun.mileage.enums.MileageMessages;
import com.dawne.com2usbaseball.domain.fun.mileage.service.MileageService;
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
 * 마일리지 저격 대상 조회 API. 조회 전용.
 * 구단×연도×포지션에 선수가 한 명뿐이라 확정적으로 나오는, 레전드 재료 카드 목록.
 *
 * 거의 바뀌지 않는 데이터라 캐시를 세 겹으로 둔다.
 *   @Cacheable(서버) / ETag(304) / Cache-Control(브라우저)
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mileage")
public class MileageController {

    private static final Duration MAX_AGE = Duration.ofHours(1);

    private final MileageService mileageService;

    @GetMapping("/sniper-targets")
    public ResponseEntity<GlobalResponse<?>> getSniperTargets(WebRequest request) {
        return respond(request, mileageService.getSniperTargets(),
                MileageMessages.MILEAGE_SNIPER_TARGET_LIST_SUCCESS);
    }

    /**
     * ETag 헤더는 checkNotModified 가 직접 써 준다(따옴표도 알아서 붙인다).
     * ResponseEntity.eTag() 로 또 붙이면 헤더가 두 벌이 되므로 쓰지 않는다.
     */
    private ResponseEntity<GlobalResponse<?>> respond(WebRequest request,
                                                        MileageSnapshot<?> snapshot,
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
