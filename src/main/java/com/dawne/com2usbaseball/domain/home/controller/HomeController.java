package com.dawne.com2usbaseball.domain.home.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.home.dto.response.HomeResponse;
import com.dawne.com2usbaseball.domain.home.service.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home")
@Tag(name = "2. [User] Home", description = "홈 첫 진입 통합 조회 API")
public class HomeController {

    private final HomeService homeService;

    @Operation(
            summary = "홈 통합 조회",
            description = """
                홈 첫 진입에 필요한 쿠폰·이벤트·공지·퀴즈를 한 번에 반환합니다.
                섹션 하나가 실패해도 200 이며, 그 칸은 null 이 되고 failedSections 에 섹션 이름이 담깁니다.
                기존 개별 엔드포인트(/api/coupons, /api/events/external, /api/notices, /api/quiz/latest)는 그대로 유지됩니다.
                """
    )
    @GetMapping
    public GlobalResponse<HomeResponse> getHome() {
        return GlobalResponse.success(homeService.getHome());
    }
}
