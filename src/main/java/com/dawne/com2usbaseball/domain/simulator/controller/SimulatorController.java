package com.dawne.com2usbaseball.domain.simulator.controller;

import com.dawne.com2usbaseball.common.support.dto.GlobalResponse;
import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.oauth.enums.AuthMessages;
import com.dawne.com2usbaseball.domain.simulator.dto.request.GsbEntryRequest;
import com.dawne.com2usbaseball.domain.simulator.dto.request.GsbSaveRequest;
import com.dawne.com2usbaseball.domain.simulator.service.SimulatorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.dawne.com2usbaseball.domain.simulator.enums.SimulatorMessages.*;

/** 고스변 시뮬레이터 — 전부 로그인 필요, 본인 기록만. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/simulators/gsb")
public class SimulatorController {

    private final SimulatorService service;

    @GetMapping
    public ResponseEntity<GlobalResponse<?>> get(HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(SIMULATOR_GET_SUCCESS, service.getAll(requireUserId(http))));
    }

    @PutMapping
    public ResponseEntity<GlobalResponse<?>> save(@Valid @RequestBody GsbSaveRequest request, HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(SIMULATOR_SAVE_SUCCESS, service.saveAll(requireUserId(http), request)));
    }

    @DeleteMapping("/{legendId}")
    public ResponseEntity<GlobalResponse<?>> delete(@PathVariable String legendId, HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(SIMULATOR_DELETE_SUCCESS, service.delete(requireUserId(http), legendId)));
    }

    @PostMapping("/saves")
    public ResponseEntity<GlobalResponse<?>> record(@Valid @RequestBody GsbEntryRequest request, HttpServletRequest http) {
        return ResponseEntity.ok(GlobalResponse.success(SIMULATOR_RECORD_SUCCESS, service.record(requireUserId(http), request)));
    }

    private Long requireUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new BaseException(AuthMessages.AUTH_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }
}
