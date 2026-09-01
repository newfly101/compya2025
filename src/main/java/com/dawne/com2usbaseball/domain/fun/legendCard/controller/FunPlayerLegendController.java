package com.dawne.com2usbaseball.domain.fun.legendCard.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendDetailResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendMaterialResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.dto.response.FunPlayerLegendResponse;
import com.dawne.com2usbaseball.domain.fun.legendCard.enums.FunPlayerLegendMessages;
import com.dawne.com2usbaseball.domain.fun.legendCard.service.FunPlayerLegendService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 레전드 재료 조회 API.
 * data_player_legend / data_player_legend_material 과 1:1 로 대응한다.
 * 조회 전용 — 등록·수정은 제공하지 않는다.
 */
@RestController("FunPlayerLegendController")
@RequiredArgsConstructor
@RequestMapping("/api/legends")
public class FunPlayerLegendController {

    private final FunPlayerLegendService funPlayerLegendService;

    /**
     * 레전드 목록.
     * withMaterials=true 면 재료 8행까지 함께 내려준다 (화면 초기 로딩용).
     */
    @GetMapping
    public GlobalResponse<?> getAll(@RequestParam(required = false) String teamCode,
                                    @RequestParam(required = false) String legendType,
                                    @RequestParam(required = false) String playerRole,
                                    @RequestParam(required = false, defaultValue = "false") boolean withMaterials) {
        if (withMaterials) {
            List<FunPlayerLegendDetailResponse> items =
                    funPlayerLegendService.getAllWithMaterials(teamCode, legendType, playerRole);
            return GlobalResponse.success(FunPlayerLegendMessages.FUN_PLAYER_LEGEND_LIST_SUCCESS, items);
        }

        List<FunPlayerLegendResponse> items =
                funPlayerLegendService.getAll(teamCode, legendType, playerRole);
        return GlobalResponse.success(FunPlayerLegendMessages.FUN_PLAYER_LEGEND_LIST_SUCCESS, items);
    }

    /** 레전드 단건 + 재료. */
    @GetMapping("/{id}")
    public GlobalResponse<FunPlayerLegendDetailResponse> get(@PathVariable String id) {
        FunPlayerLegendDetailResponse item = funPlayerLegendService.getById(id);
        return GlobalResponse.success(FunPlayerLegendMessages.FUN_PLAYER_LEGEND_DETAIL_SUCCESS, item);
    }

    /** 특정 레전드의 재료만. */
    @GetMapping("/{id}/materials")
    public GlobalResponse<List<FunPlayerLegendMaterialResponse>> getMaterials(@PathVariable String id) {
        List<FunPlayerLegendMaterialResponse> items = funPlayerLegendService.getMaterials(id);
        return GlobalResponse.success(FunPlayerLegendMessages.FUN_PLAYER_LEGEND_MATERIAL_LIST_SUCCESS, items);
    }
}
