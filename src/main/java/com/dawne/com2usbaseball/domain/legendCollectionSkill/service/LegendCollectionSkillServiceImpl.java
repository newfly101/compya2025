package com.dawne.com2usbaseball.domain.legendCollectionSkill.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.BatchEventRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.SaveSkillsRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.request.SkillEventRequest;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.response.LegendSkillResponse;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.response.LegendSkillResponse.SlotItem;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.SkillLogEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.SkillMasterEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.entity.UserLegendSkillEntity;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillAction;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillKind;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillTier;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.repository.LegendCollectionSkillRepository;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.service.support.SkillRules;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.service.support.SkillRules.Progress;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.dawne.com2usbaseball.common.support.event.ActivitySavedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.LegendCollectionSkillMessages.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LegendCollectionSkillServiceImpl implements LegendCollectionSkillService {

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final List<SlotItem> EMPTY_SLOTS = List.of(SkillRules.EMPTY, SkillRules.EMPTY, SkillRules.EMPTY);

    private final LegendCollectionSkillRepository repository;
    private final ApplicationEventPublisher events;

    @Override
    public List<LegendSkillResponse> getMySkills(Long userId) {
        Map<String, List<SlotItem>> states = repository.findStates(userId).stream()
                .collect(Collectors.toMap(UserLegendSkillEntity::getLegendId, LegendCollectionSkillServiceImpl::toSlots));
        Map<String, List<SkillAction>> logs = new HashMap<>();
        for (SkillLogEntity l : repository.findLogs(userId, null)) {
            logs.computeIfAbsent(l.getLegendId(), k -> new ArrayList<>()).add(l.getAction());
        }
        Map<String, SkillKind> kindById = kindsById(states.values().stream().flatMap(List::stream)
                .map(SlotItem::skillId).filter(Objects::nonNull).distinct().toList());
        return repository.findTargetLegends(userId).stream()
                .map(m -> {
                    List<SlotItem> slots = states.getOrDefault(m.get("legendId"), EMPTY_SLOTS);
                    return toResponse(m.get("legendId"), m.get("status"), slots,
                            SkillRules.progress(logs.getOrDefault(m.get("legendId"), List.of())),
                            kindsOf(slots, kindById));
                })
                .toList();
    }

    @Override
    @Transactional
    public LegendSkillResponse saveSkills(Long userId, String legendId, SaveSkillsRequest request) {
        String status = requireTarget(userId, legendId);
        Progress current = progressOf(userId, legendId);
        if (current.enhanceCount() > 0 || current.bulkMode() != null) {
            throw bad(LEGEND_COLLECTION_SKILL_LOCKED);
        }

        List<String> ids = request.slots().stream().map(SaveSkillsRequest.Slot::skillId).toList();
        if (new HashSet<>(ids).size() != 3) {
            throw bad(LEGEND_COLLECTION_SKILL_INVALID_SLOTS);
        }
        Map<String, SkillMasterEntity> masters = repository.findSkills(ids).stream()
                .collect(Collectors.toMap(SkillMasterEntity::getId, s -> s));
        String role = repository.findLegendRole(legendId).orElseThrow(() -> bad(LEGEND_COLLECTION_SKILL_NOT_TARGET));

        List<SlotItem> slots = new ArrayList<>();
        for (SaveSkillsRequest.Slot s : request.slots()) {
            SkillMasterEntity m = masters.get(s.skillId());
            if (m == null) {
                throw new BaseException(LEGEND_COLLECTION_SKILL_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            if (!m.getPlayerRole().equals(role)) {
                throw bad(LEGEND_COLLECTION_SKILL_INVALID_SLOTS);
            }
            // 등록 등급은 E~C, 그리고 스킬 등급별 상한 이하
            if (s.baseGrade().ordinal() > SkillTier.C.ordinal()
                    || s.baseGrade().ordinal() > SkillRules.cap(m.getSkillGrade()).ordinal()) {
                throw bad(LEGEND_COLLECTION_SKILL_INVALID_GRADE);
            }
            slots.add(new SlotItem(s.skillId(), s.baseGrade(), s.baseGrade()));
        }

        repository.upsertState(toEntity(userId, legendId, slots));
        repository.insertLog(userId, legendId, SkillAction.SAVE, null, snapshot(slots));
        events.publishEvent(new ActivitySavedEvent(userId)); // 저장 XP — 커밋 후 gamification 이 받는다
        return toResponse(legendId, status, slots, SkillRules.progress(List.of(SkillAction.SAVE)), List.of());
    }

    @Override
    @Transactional
    public LegendSkillResponse applyEvent(Long userId, String legendId, SkillEventRequest request) {
        String status = requireTarget(userId, legendId);
        SkillAction action = request.action();
        if (action == SkillAction.SAVE) {
            throw bad(LEGEND_COLLECTION_SKILL_ACTION_NOT_ALLOWED);
        }
        // 액자는 등록·초기화만 — 강화 계열 이벤트는 보유중만
        if ("FRAME".equals(status) && action != SkillAction.RESET) {
            throw bad(LEGEND_COLLECTION_SKILL_FRAME_NOT_ENHANCEABLE);
        }
        List<SlotItem> slots = repository.findState(userId, legendId)
                .map(LegendCollectionSkillServiceImpl::toSlots).orElse(EMPTY_SLOTS);

        List<SkillKind> kinds = kindsOf(slots, kindsById(slots.stream().map(SlotItem::skillId)
                .filter(Objects::nonNull).toList()));

        List<SlotItem> next = SkillRules.apply(action, request.slot(), slots, kinds, progressOf(userId, legendId));
        repository.upsertState(toEntity(userId, legendId, next));
        // 되돌리기·초기화는 로그를 남기지 않고 정리한다 (집계 결과는 같다)
        if (action == SkillAction.UNDO) {
            repository.deleteLogsAfterLastSave(userId, legendId);
            return toResponse(legendId, status, next, SkillRules.progress(List.of()), kinds);
        }
        if (action == SkillAction.RESET) {
            repository.deleteLogs(userId, legendId);
            return toResponse(legendId, status, next, SkillRules.progress(List.of()), kinds);
        }
        boolean withSlot = action == SkillAction.BASE_UP || action == SkillAction.GCG_UP || action == SkillAction.GGG_UP;
        repository.insertLog(userId, legendId, action, withSlot ? request.slot() : null, snapshot(next));
        return toResponse(legendId, status, next, progressOf(userId, legendId), kinds);
    }

    @Override
    @Transactional
    public LegendSkillResponse applyBatch(Long userId, String legendId, BatchEventRequest request) {
        String status = requireTarget(userId, legendId);
        if ("FRAME".equals(status)) {
            throw bad(LEGEND_COLLECTION_SKILL_FRAME_NOT_ENHANCEABLE);
        }
        List<SlotItem> slots = repository.findState(userId, legendId)
                .map(LegendCollectionSkillServiceImpl::toSlots).orElse(EMPTY_SLOTS);
        List<SkillKind> kinds = kindsOf(slots, kindsById(slots.stream().map(SlotItem::skillId)
                .filter(Objects::nonNull).toList()));
        List<SkillAction> actions = repository.findLogs(userId, legendId).stream()
                .map(SkillLogEntity::getAction).collect(Collectors.toCollection(ArrayList::new));

        // 전부 통과한 뒤에만 쓴다 — 중간 위반이면 DB 는 그대로
        record Pending(SkillAction action, int slot, String snapshot) {
        }
        List<Pending> pending = new ArrayList<>();
        for (int i = 0; i < request.actions().size(); i++) {
            BatchEventRequest.Item it = request.actions().get(i);
            try {
                if (it.action() != SkillAction.BASE_UP && it.action() != SkillAction.GCG_UP
                        && it.action() != SkillAction.GGG_UP) {
                    throw bad(LEGEND_COLLECTION_SKILL_ACTION_NOT_ALLOWED);
                }
                slots = SkillRules.apply(it.action(), it.slot(), slots, kinds, SkillRules.progress(actions));
            } catch (BaseException e) {
                log.warn("[legendCollectionSkill] batch {}번째({}) 거부 — legendId={}", i + 1, it.action(), legendId);
                throw e;
            }
            actions.add(it.action());
            pending.add(new Pending(it.action(), it.slot(), snapshot(slots)));
        }
        repository.upsertState(toEntity(userId, legendId, slots));
        for (Pending p : pending) {
            repository.insertLog(userId, legendId, p.action(), p.slot(), p.snapshot());
        }
        return toResponse(legendId, status, slots, SkillRules.progress(actions), kinds);
    }

    @Override
    @Transactional
    public void deleteByLegends(Long userId, Collection<String> legendIds) {
        repository.deleteStates(userId, new ArrayList<>(legendIds));
    }

    private String requireTarget(Long userId, String legendId) {
        return repository.findTargetStatus(userId, legendId)
                .orElseThrow(() -> bad(LEGEND_COLLECTION_SKILL_NOT_TARGET));
    }

    private Progress progressOf(Long userId, String legendId) {
        return SkillRules.progress(repository.findLogs(userId, legendId).stream()
                .map(SkillLogEntity::getAction).toList());
    }

    private static LegendSkillResponse toResponse(String legendId, String status, List<SlotItem> slots,
                                                  Progress progress, List<SkillKind> kinds) {
        Progress p = SkillRules.withBulkUsage(progress, slots, kinds);
        return new LegendSkillResponse(legendId, status, slots, p.bulkMode(), p.usage(), p.enhanceCount());
    }

    private Map<String, SkillKind> kindsById(List<String> ids) {
        if (ids.isEmpty()) {
            return Map.of();
        }
        return repository.findSkills(ids).stream()
                .collect(Collectors.toMap(SkillMasterEntity::getId, SkillMasterEntity::getSkillGrade));
    }

    /** 슬롯과 같은 순서, 빈 슬롯은 null. */
    private static List<SkillKind> kindsOf(List<SlotItem> slots, Map<String, SkillKind> byId) {
        List<SkillKind> kinds = new ArrayList<>();
        for (SlotItem s : slots) {
            kinds.add(s.skillId() == null ? null : byId.get(s.skillId()));
        }
        return kinds;
    }

    private static List<SlotItem> toSlots(UserLegendSkillEntity e) {
        return List.of(
                new SlotItem(e.getSkill1Id(), e.getSkill1Base(), e.getSkill1Current()),
                new SlotItem(e.getSkill2Id(), e.getSkill2Base(), e.getSkill2Current()),
                new SlotItem(e.getSkill3Id(), e.getSkill3Base(), e.getSkill3Current()));
    }

    private static UserLegendSkillEntity toEntity(Long userId, String legendId, List<SlotItem> s) {
        return UserLegendSkillEntity.builder().userId(userId).legendId(legendId)
                .skill1Id(s.get(0).skillId()).skill1Base(s.get(0).baseGrade()).skill1Current(s.get(0).currentGrade())
                .skill2Id(s.get(1).skillId()).skill2Base(s.get(1).baseGrade()).skill2Current(s.get(1).currentGrade())
                .skill3Id(s.get(2).skillId()).skill3Base(s.get(2).baseGrade()).skill3Current(s.get(2).currentGrade())
                .build();
    }

    /** 로그 스냅샷 [{skillId, base, current} x3]. */
    private static String snapshot(List<SlotItem> slots) {
        List<Map<String, Object>> rows = slots.stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("skillId", s.skillId());
            m.put("base", s.baseGrade());
            m.put("current", s.currentGrade());
            return m;
        }).toList();
        try {
            return JSON.writeValueAsString(rows);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }

    private static BaseException bad(Enum<?> code) {
        return new BaseException(code, HttpStatus.BAD_REQUEST);
    }
}
