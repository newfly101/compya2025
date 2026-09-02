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
 * 레전드 재료 조회 API. 조회 전용.
 * data_player_legend / data_player_legend_material 과 1:1 로 대응한다.
 *
 * 화면이 쓰는 건 단건 조회 하나뿐이다. v1 재료 화면이 폐기되면서
 * 목록 조회와 재료 전용 조회는 호출부가 사라졌다 (아래 각 메서드 주석 참고).
 */
@RestController("FunPlayerLegendController")
@RequiredArgsConstructor
@RequestMapping("/api/legends")
public class FunPlayerLegendController {

    private final FunPlayerLegendService funPlayerLegendService;

    /**
     * [연결 없음] 레전드 목록. withMaterials=true 면 재료 8행까지 함께 내려준다.
     * v1 재료 화면이 진입 시 74명 × 재료를 통째로 받던 경로였다.
     * v2 는 목록을 /api/legend-stats 에서 받고 재료는 펼친 행만 단건으로 받는다.
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

    /** 레전드 단건 + 재료. v2 평점표가 행을 펼칠 때 호출한다. */
    @GetMapping("/{id}")
    public GlobalResponse<FunPlayerLegendDetailResponse> get(@PathVariable String id) {
        FunPlayerLegendDetailResponse item = funPlayerLegendService.getById(id);
        return GlobalResponse.success(FunPlayerLegendMessages.FUN_PLAYER_LEGEND_DETAIL_SUCCESS, item);
    }

    /**
     * [연결 없음] 특정 레전드의 재료만.
     * 단건 조회가 재료를 포함해 내려주므로 화면에서 따로 쓸 일이 없어졌다.
     */
    @GetMapping("/{id}/materials")
    public GlobalResponse<List<FunPlayerLegendMaterialResponse>> getMaterials(@PathVariable String id) {
        List<FunPlayerLegendMaterialResponse> items = funPlayerLegendService.getMaterials(id);
        return GlobalResponse.success(FunPlayerLegendMessages.FUN_PLAYER_LEGEND_MATERIAL_LIST_SUCCESS, items);
    }
}
