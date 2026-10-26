package com.dawne.com2usbaseball.domain.simulator.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.common.util.JsonUtils;
import com.dawne.com2usbaseball.domain.simulator.dto.request.GsbEntryRequest;
import com.dawne.com2usbaseball.domain.simulator.dto.request.GsbSaveRequest;
import com.dawne.com2usbaseball.domain.simulator.dto.response.GsbDeletedResponse;
import com.dawne.com2usbaseball.domain.simulator.dto.response.GsbEntryResponse;
import com.dawne.com2usbaseball.domain.simulator.dto.response.GsbListResponse;
import com.dawne.com2usbaseball.domain.simulator.dto.response.GsbRecordResponse;
import com.dawne.com2usbaseball.domain.simulator.dto.response.GsbSavedResponse;
import com.dawne.com2usbaseball.domain.simulator.entity.SimulatorSaveEntity;
import com.dawne.com2usbaseball.domain.simulator.repository.SimulatorRepository;
import com.dawne.com2usbaseball.domain.simulator.repository.mapper.SimulatorMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.dawne.com2usbaseball.domain.simulator.enums.SimulatorMessages.SIMULATOR_INVALID_TIER;
import static com.dawne.com2usbaseball.domain.simulator.enums.SimulatorMessages.SIMULATOR_NOT_FOUND;
import static com.dawne.com2usbaseball.domain.simulator.enums.SimulatorMessages.SIMULATOR_STORE_UNAVAILABLE;

/** 고스변 시뮬레이터 — 내 기록은 Valkey, 이미지 저장 기록은 DB. 메서드 4개라 단일 클래스. */
@Slf4j
@Service
@RequiredArgsConstructor
public class SimulatorService {

    private static final String NO_EMAIL = "noemail";

    private final SimulatorRepository repository;
    private final SimulatorMapper mapper;

    /** Hash 안 값 모양 — 짧은 키 */
    private record Cell(int g, int c, List<String> s, List<String> t) {
    }

    public GsbListResponse getAll(Long userId) {
        String key = keyOf(userId);
        Map<Object, Object> raw;
        try {
            raw = repository.findAll(key);
        } catch (RuntimeException e) {
            throw unavailable(e);
        }
        List<GsbEntryResponse> items = new ArrayList<>();
        raw.forEach((field, value) -> {
            try {
                Cell cell = JsonUtils.toObject(String.valueOf(value), Cell.class);
                if (cell == null || cell.s() == null || cell.s().size() != 3) {
                    throw new IllegalArgumentException("셀 모양 불일치");
                }
                items.add(new GsbEntryResponse(String.valueOf(field), cell.g(), cell.c(), cell.s(), cell.t()));
            } catch (RuntimeException e) {
                log.warn("시뮬레이터 기록 값이 깨져 건너뜀: userId={}, legendId={}", userId, field);
            }
        });
        return new GsbListResponse(items);
    }

    public GsbSavedResponse saveAll(Long userId, GsbSaveRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (GsbEntryRequest e : request.items()) {
            fields.put(e.legendId(), JsonUtils.toJson(new Cell(e.gsbCount(), e.selCount(), e.skillIds(), e.skillTiers())));
        }
        String key = keyOf(userId);
        try {
            repository.saveAll(key, fields);
        } catch (RuntimeException e) {
            throw unavailable(e);
        }
        return new GsbSavedResponse(fields.size());
    }

    public GsbDeletedResponse delete(Long userId, String legendId) {
        String key = keyOf(userId);
        try {
            return new GsbDeletedResponse(repository.delete(key, legendId));
        } catch (RuntimeException e) {
            throw unavailable(e);
        }
    }

    /** 이미지 저장 기록. 서버는 레전드·스킬 id 존재만 확인한다(횟수·스킬 조합은 클라이언트 값 신뢰). */
    @Transactional
    public GsbRecordResponse record(Long userId, GsbEntryRequest r) {
        List<String> skills = r.skillIds();
        List<String> tiers = r.skillTiers();
        if (tiers == null) {
            throw new BaseException(SIMULATOR_INVALID_TIER, HttpStatus.BAD_REQUEST);
        }
        if (mapper.countLegend(r.legendId()) == 0
                || mapper.countSkills(new ArrayList<>(new HashSet<>(skills))) != new HashSet<>(skills).size()) {
            throw new BaseException(SIMULATOR_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        SimulatorSaveEntity entity = SimulatorSaveEntity.builder()
                .userId(userId).legendId(r.legendId())
                .gsbCount(r.gsbCount()).selCount(r.selCount())
                .skillId1(skills.get(0)).skillId2(skills.get(1)).skillId3(skills.get(2))
                .skillTier1(tiers.get(0)).skillTier2(tiers.get(1)).skillTier3(tiers.get(2))
                .build();
        mapper.insertSave(entity);
        return new GsbRecordResponse(entity.getId());
    }

    /** 키 = 이메일은 호출마다 조회. 이메일에 ':'·공백·제어문자가 있으면 noemail (SCAN 패턴 보호). */
    private String keyOf(Long userId) {
        String email = mapper.selectEmailByUserId(userId);
        boolean safe = email != null && email.chars().noneMatch(c -> c == ':' || Character.isWhitespace(c) || Character.isISOControl(c));
        return repository.key(userId, safe ? email : NO_EMAIL);
    }

    /** 키(이메일 포함)는 로그에 남기지 않는다. */
    private BaseException unavailable(RuntimeException e) {
        log.error("시뮬레이터 Valkey 접근 실패", e);
        return new BaseException(SIMULATOR_STORE_UNAVAILABLE, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
