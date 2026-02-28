package com.dawne.com2usbaseball.domain.player.controller;

import com.dawne.com2usbaseball.common.support.dto.ListResponse;
import com.dawne.com2usbaseball.common.support.dto.OperationResponse;
import com.dawne.com2usbaseball.domain.player.dto.request.AdminPlayerCardCreateRequest;
import com.dawne.com2usbaseball.domain.player.dto.response.team.TeamResponse;
import com.dawne.com2usbaseball.domain.player.enums.PlayerMessages;
import com.dawne.com2usbaseball.domain.player.service.AdminPlayerCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/player")
public class AdminPlayerCardController {

    private final AdminPlayerCardService adminPlayerCardservice;

//    @GetMapping
//    public ListResponse<PlayerCardResponse> getAllPlayerCardList() {
//
//    }

//    @GetMapping("grade/{grade}")
//    public ListResponse<PlayerCardResponse> getPlayerCardListByGrade(@PathVariable Grade grade) {
//
//    }

    @GetMapping("teams")
    public ListResponse<TeamResponse> getPlayerTeams() {
        return adminPlayerCardservice.getAllPlayerTeamInfo();
    }

    @PostMapping
    public OperationResponse<PlayerMessages> createPlayerCard(@RequestBody AdminPlayerCardCreateRequest request) {
       return adminPlayerCardservice.createPlayerCardInfo(request.toFormat());
    }

//    @PatchMapping("/{id}")
//    public OperationResponse<PlayerMessages> updatePlayerCard(@PathVariable Long id, @RequestBody AdminPlayerCardCreateRequest request) {
//
//    }
//
//    @PatchMapping("/{id}/attribute")
//    public OperationResponse<PlayerMessages> updatePlayerCardAttribute(@PathVariable Long id, @RequestBody AdminPlayerCardCreateRequest request) {
//
//    }
//
//    @PostMapping("list")
//    public OperationResponse<PlayerMessages> createPlayerCardList(@RequestBody AdminPlayerCardCreateRequest request) {
//
//    }
//
//    @PostMapping("list/attribute")
//    public OperationResponse<PlayerMessages> createPlayerCardAttributeList(@RequestBody AdminPlayerCardCreateRequest request) {
//
//    }

}
