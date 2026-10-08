package com.dawne.com2usbaseball.domain.gamification.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.request.AdjustRequest;
import com.dawne.com2usbaseball.domain.gamification.dto.request.TitleActionRequest;
import com.dawne.com2usbaseball.domain.gamification.dto.response.AdminTitleResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.response.TitleGrantResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.response.TitleRevokeResponse;
import java.util.List;
import com.dawne.com2usbaseball.domain.gamification.dto.response.EarlyAdopterGrantResponse;
import com.dawne.com2usbaseball.domain.gamification.dto.response.LedgerPageResponse;
import com.dawne.com2usbaseball.domain.gamification.enums.GamificationMessages;
import com.dawne.com2usbaseball.domain.gamification.service.AdminGamificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "1. [Admin] Gamification", description = "등급·칭호·포인트 운영자 API")
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/gamification")
public class AdminGamificationController {

    private final AdminGamificationService adminService;

    @Operation(summary = "얼리어답터 칭호 일괄 지급",
            description = "dryRun=true(기본)면 대상 수와 샘플 publicId 만 보여주고 기록하지 않는다. false 일 때만 실제 지급.")
    @PostMapping("/early-adopters/grant")
    public GlobalResponse<EarlyAdopterGrantResponse> grantEarlyAdopters(
            @RequestParam(defaultValue = "true") boolean dryRun) {
        return GlobalResponse.success(
                dryRun ? GamificationMessages.GAMIFICATION_EARLY_ADOPTERS_PREVIEWED
                        : GamificationMessages.GAMIFICATION_EARLY_ADOPTERS_GRANTED,
                adminService.grantEarlyAdopters(dryRun));
    }

    @Operation(summary = "XP·포인트 지급/회수", description = "음수 허용(회수). 사유 필수. 원장에 한 줄 남는다.")
    @PostMapping("/adjust")
    public GlobalResponse<LedgerPageResponse> adjust(@Valid @RequestBody AdjustRequest request) {
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_ADJUSTED, adminService.adjust(request));
    }

    @Operation(summary = "유저 원장 조회", description = "최근 20건과 현재 합계.")
    @GetMapping("/users/{publicId}/ledger")
    public GlobalResponse<LedgerPageResponse> ledger(@PathVariable String publicId) {
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_LEDGER_SUCCESS, adminService.ledger(publicId));
    }

    @Operation(summary = "유저 칭호 목록", description = "전체 칭호 정의 + 이 유저의 보유·대표 여부.")
    @GetMapping("/users/{publicId}/titles")
    public GlobalResponse<List<AdminTitleResponse>> titles(@PathVariable String publicId) {
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_TITLE_LISTED, adminService.titles(publicId));
    }

    @Operation(summary = "MANUAL 칭호 지급", description = "이미 보유면 granted=false. GM 은 대상이 ADMIN 일 때만.")
    @PostMapping("/titles/grant")
    public GlobalResponse<TitleGrantResponse> grantTitle(@Valid @RequestBody TitleActionRequest request,
            HttpServletRequest httpRequest) {
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_TITLE_GRANTED, adminService.grantTitle(request, (Long) httpRequest.getAttribute("userId")));
    }

    @Operation(summary = "MANUAL 칭호 회수", description = "칭호 삭제 + 보너스 포인트 음수 원장. 미보유면 revoked=false.")
    @PostMapping("/titles/revoke")
    public GlobalResponse<TitleRevokeResponse> revokeTitle(@Valid @RequestBody TitleActionRequest request,
            HttpServletRequest httpRequest) {
        return GlobalResponse.success(GamificationMessages.GAMIFICATION_TITLE_REVOKED, adminService.revokeTitle(request, (Long) httpRequest.getAttribute("userId")));
    }
}
