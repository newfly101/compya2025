package com.dawne.com2usbaseball.domain.fun.team.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.domain.fun.team.dto.response.FunTeamResponse;
import com.dawne.com2usbaseball.domain.fun.team.enums.FunTeamMessages;
import com.dawne.com2usbaseball.domain.fun.team.service.FunTeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * fun_teams 조회 API. 구단 코드 → 한글명 매핑 등 FE 참조용.
 * 조회 전용 — 등록·수정은 제공하지 않는다.
 */
@RestController("FunTeamController")
@RequiredArgsConstructor
@RequestMapping("/api/teams")
public class FunTeamController {

    private final FunTeamService funTeamService;

    /** 전체 목록. ORDER BY team_code, start_year. */
    @GetMapping
    public GlobalResponse<List<FunTeamResponse>> getAll() {
        List<FunTeamResponse> items = funTeamService.getAll();
        return GlobalResponse.success(FunTeamMessages.FUN_TEAM_LIST_SUCCESS, items);
    }

    /** 해당 코드의 행 전부. 팀명 변경 이력이 있을 수 있어 목록으로 내려준다. */
    @GetMapping("/{teamCode}")
    public GlobalResponse<List<FunTeamResponse>> getByTeamCode(@PathVariable String teamCode) {
        List<FunTeamResponse> items = funTeamService.getByTeamCode(teamCode);
        return GlobalResponse.success(FunTeamMessages.FUN_TEAM_LIST_SUCCESS, items);
    }
}
