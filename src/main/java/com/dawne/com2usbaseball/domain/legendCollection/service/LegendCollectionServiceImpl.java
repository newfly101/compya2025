package com.dawne.com2usbaseball.domain.legendCollection.service;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SaveAcquiredAtRequest;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SaveChangesRequest;
import com.dawne.com2usbaseball.domain.legendCollection.dto.request.SavePreferencesRequest;
import com.dawne.com2usbaseball.domain.legendCollection.dto.response.LegendCollectionResponse;
import com.dawne.com2usbaseball.domain.legendCollection.dto.response.LegendScheduleResponse;
import com.dawne.com2usbaseball.domain.legendCollection.entity.LegendStateEntity;
import com.dawne.com2usbaseball.domain.legendCollection.entity.MaterialRefEntity;
import com.dawne.com2usbaseball.domain.legendCollection.entity.MaterialStateEntity;
import com.dawne.com2usbaseball.domain.legendCollection.entity.PreferenceEntity;
import com.dawne.com2usbaseball.domain.legendCollection.enums.LegendStatus;
import com.dawne.com2usbaseball.domain.legendCollection.enums.MaterialState;
import com.dawne.com2usbaseball.domain.legendCollection.repository.LegendCollectionRepository;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.service.LegendCollectionSkillService;
import com.dawne.com2usbaseball.common.support.event.ActivitySavedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import static com.dawne.com2usbaseball.domain.legendCollection.enums.LegendCollectionMessages.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LegendCollectionServiceImpl implements LegendCollectionService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    /** 히스토리 모드 1일차(월요일) 고정 기준일 — REQ-LCOL-19. */
    private static final LocalDate DAY_ONE = LocalDate.of(2026, 9, 28);
    private static final int CYCLE_DAYS = 14;
    private static final int MAX_PREFERENCES = 10;

    private final LegendCollectionRepository repository;
    private final LegendCollectionSkillService skillService;
    private final ApplicationEventPublisher events;

    @Override
    public LegendCollectionResponse getMyCollection(Long userId) {
        LocalDateTime latest = repository.findLatestUpdatedAt(userId);
        return LegendCollectionResponse.of(
                latest == null ? null : latest.toString(),
                repository.findLegendStates(userId),
                repository.findMaterialStates(userId),
                repository.findPreferences(userId));
    }

    @Override
    @Transactional
    public LegendCollectionResponse saveChanges(Long userId, SaveChangesRequest request) {
        checkVersion(userId, request.version());

        Set<String> legendIds = new HashSet<>(repository.findAllLegendIds());
        Map<String, String> materialToLegend = repository.findAllMaterialRefs().stream()
                .collect(Collectors.toMap(MaterialRefEntity::getId, MaterialRefEntity::getLegendId));
        Map<String, LegendStatus> curLegend = repository.findLegendStates(userId).stream()
                .collect(Collectors.toMap(LegendStateEntity::getLegendId, LegendStateEntity::getStatus));
        Map<String, MaterialState> curMaterial = repository.findMaterialStates(userId).stream()
                .collect(Collectors.toMap(MaterialStateEntity::getMaterialId, MaterialStateEntity::getState));

        // 같은 id 가 두 번 오면 마지막 값이 이긴다
        Map<String, LegendStatus> reqLegend = new LinkedHashMap<>();
        Map<String, LocalDate> reqOn = new HashMap<>();
        for (var c : orEmpty(request.legends())) {
            if (!legendIds.contains(c.legendId())) {
                throw bad(LEGEND_COLLECTION_LEGEND_NOT_FOUND);
            }
            checkNotFuture(c.acquiredOn());
            reqLegend.put(c.legendId(), c.status());
            reqOn.put(c.legendId(), c.acquiredOn());
        }
        Map<String, MaterialState> reqMaterial = new LinkedHashMap<>();
        for (var c : orEmpty(request.materials())) {
            if (!materialToLegend.containsKey(c.materialId())) {
                throw bad(LEGEND_COLLECTION_MATERIAL_NOT_FOUND);
            }
            reqMaterial.put(c.materialId(), c.state());
        }
        Set<String> resetLegends = new LinkedHashSet<>();
        for (String id : orEmpty(request.resetLegendIds())) {
            if (!legendIds.contains(id)) {
                throw bad(LEGEND_COLLECTION_LEGEND_NOT_FOUND);
            }
            resetLegends.add(id);
        }

        // 새로 보유중이 되는 레전드는 재료 0/8 로 초기화된다(REQ-LCOL-06)
        Set<String> newlyOwned = new LinkedHashSet<>();
        for (var e : reqLegend.entrySet()) {
            if (e.getValue() == LegendStatus.OWNED && curLegend.get(e.getKey()) != LegendStatus.OWNED) {
                newlyOwned.add(e.getKey());
            }
        }
        Set<String> wipe = new LinkedHashSet<>(resetLegends);
        wipe.addAll(newlyOwned);

        // 재료 전환 검사 — 초기화되는 레전드는 "미보유에서 다시 시작"으로 본다
        Map<String, MaterialState> toApply = new LinkedHashMap<>();
        for (var e : reqMaterial.entrySet()) {
            String legendId = materialToLegend.get(e.getKey());
            if (newlyOwned.contains(legendId)) {
                continue; // 어차피 지워진다
            }
            MaterialState cur = wipe.contains(legendId)
                    ? MaterialState.NONE
                    : curMaterial.getOrDefault(e.getKey(), MaterialState.NONE);
            MaterialState next = e.getValue();
            if (cur == next) {
                continue;
            }
            LegendStatus finalStatus = reqLegend.getOrDefault(legendId,
                    curLegend.getOrDefault(legendId, LegendStatus.NONE));
            if (finalStatus == LegendStatus.OWNED) {
                throw bad(LEGEND_COLLECTION_OWNED_LEGEND_LOCKED);
            }
            if (cur == MaterialState.INSERTED) {
                throw bad(LEGEND_COLLECTION_INVALID_MATERIAL_TRANSITION);
            }
            toApply.put(e.getKey(), next);
        }

        repository.deleteMaterialStatesByLegendIds(userId, new ArrayList<>(wipe));
        toApply.forEach((materialId, state) -> {
            if (state == MaterialState.NONE) {
                repository.deleteMaterialState(userId, materialId);
            } else {
                repository.upsertMaterialState(userId, materialId, state);
            }
        });
        reqLegend.forEach((legendId, status) ->
                changeLegend(userId, legendId, curLegend.getOrDefault(legendId, LegendStatus.NONE), status, reqOn.get(legendId)));

        // 보유중 해제 → 스킬 기록 삭제, 로그는 유지 (legendCollectionSkills REQ-LCSK-17)
        List<String> released = reqLegend.entrySet().stream()
                .filter(e -> e.getValue() != LegendStatus.OWNED && curLegend.get(e.getKey()) == LegendStatus.OWNED)
                .map(Map.Entry::getKey).toList();
        if (!released.isEmpty()) {
            skillService.deleteByLegends(userId, released);
        }

        if (!newlyOwned.isEmpty()) {
            removeFromPreferences(userId, newlyOwned);
        }
        events.publishEvent(new ActivitySavedEvent(userId)); // 저장 XP — 커밋 후 gamification 이 받는다
        return getMyCollection(userId);
    }

    @Override
    @Transactional
    public LegendCollectionResponse savePreferences(Long userId, SavePreferencesRequest request) {
        checkVersion(userId, request.version());

        List<SavePreferencesRequest.Preference> prefs = orEmpty(request.preferences());
        if (prefs.size() > MAX_PREFERENCES) {
            throw bad(LEGEND_COLLECTION_PREFERENCE_LIMIT_EXCEEDED);
        }
        Set<String> legendIds = new HashSet<>(repository.findAllLegendIds());
        Map<String, LegendStatus> curLegend = repository.findLegendStates(userId).stream()
                .collect(Collectors.toMap(LegendStateEntity::getLegendId, LegendStateEntity::getStatus));

        Set<String> seenLegend = new HashSet<>();
        Set<Integer> seenRank = new HashSet<>();
        for (var p : prefs) {
            if (!legendIds.contains(p.legendId())) {
                throw bad(LEGEND_COLLECTION_LEGEND_NOT_FOUND);
            }
            if (!seenLegend.add(p.legendId()) || !seenRank.add(p.rank())) {
                throw bad(LEGEND_COLLECTION_PREFERENCE_INVALID);
            }
            if (curLegend.get(p.legendId()) == LegendStatus.OWNED) {
                throw bad(LEGEND_COLLECTION_PREFERENCE_OWNED_LEGEND);
            }
        }

        Map<String, Boolean> frames = new LinkedHashMap<>();
        for (var f : orEmpty(request.frames())) {
            if (!legendIds.contains(f.legendId())) {
                throw bad(LEGEND_COLLECTION_LEGEND_NOT_FOUND);
            }
            if (curLegend.get(f.legendId()) == LegendStatus.OWNED) {
                throw bad(LEGEND_COLLECTION_PREFERENCE_OWNED_LEGEND);
            }
            frames.put(f.legendId(), f.frame());
        }
        frames.forEach((legendId, frame) -> changeLegend(userId, legendId,
                curLegend.getOrDefault(legendId, LegendStatus.NONE),
                frame ? LegendStatus.FRAME : LegendStatus.NONE, null));

        // 순위는 1부터 빈틈없이 다시 매긴다
        repository.deleteAllPreferences(userId);
        List<SavePreferencesRequest.Preference> sorted = prefs.stream()
                .sorted(Comparator.comparingInt(SavePreferencesRequest.Preference::rank)).toList();
        for (int i = 0; i < sorted.size(); i++) {
            repository.insertPreference(userId, sorted.get(i).legendId(), i + 1);
        }
        return getMyCollection(userId);
    }

    @Override
    @Transactional
    public LegendCollectionResponse saveAcquiredAt(Long userId, String legendId, SaveAcquiredAtRequest request) {
        LegendStateEntity state = repository.findLegendStates(userId).stream()
                .filter(s -> s.getLegendId().equals(legendId)).findFirst().orElse(null);
        if (state == null) {
            throw bad(LEGEND_COLLECTION_ACQUIRED_AT_NOT_OWNED);
        }
        if (state.getStatus() == LegendStatus.FRAME && request.isAcquiredSet()) {
            throw bad(LEGEND_COLLECTION_ACQUIRED_AT_NOT_OWNED);
        }
        checkNotFuture(request.getFrameAcquiredAt());
        checkNotFuture(request.getAcquiredAt());
        repository.updateAcquiredDates(userId, legendId, request.isFrameSet(), request.getFrameAcquiredAt(),
                request.isAcquiredSet(), request.getAcquiredAt());
        return getMyCollection(userId);
    }

    private static void checkNotFuture(LocalDate date) {
        if (date != null && date.isAfter(LocalDate.now(KST))) {
            throw bad(LEGEND_COLLECTION_ACQUIRED_AT_FUTURE);
        }
    }

    @Override
    public LegendScheduleResponse getSchedule(Long userId) {
        int today = dayNoOf(LocalDate.now(KST));
        return LegendScheduleResponse.of(today, repository.findSchedule(userId));
    }

    /** (오늘 - 기준일) mod 14 + 1. 기준일 이전 날짜도 음수 없이 1~14 로 나온다. */
    static int dayNoOf(LocalDate date) {
        return (int) Math.floorMod(ChronoUnit.DAYS.between(DAY_ONE, date), (long) CYCLE_DAYS) + 1;
    }

    /**
     * 상태가 실제로 바뀔 때만 로그 1행. on 이 없으면 오늘(KST).
     * 미보유→액자는 액자 획득일=on, 보유중이 되면 보유일=on(액자 획득일은 유지), 보유중→액자는 보유일 비움(액자 획득일 유지).
     */
    private void changeLegend(Long userId, String legendId, LegendStatus from, LegendStatus to, LocalDate on) {
        if (from == to) {
            return;
        }
        repository.insertLegendStateLog(userId, legendId, from, to);
        if (to == LegendStatus.NONE) {
            repository.deleteLegendState(userId, legendId);
            return;
        }
        LocalDate day = on != null ? on : LocalDate.now(KST);
        boolean owned = to == LegendStatus.OWNED;
        repository.upsertLegendState(userId, legendId, to, owned ? day : null,
                !owned && from == LegendStatus.NONE ? day : null);
    }

    private void removeFromPreferences(Long userId, Set<String> removed) {
        List<PreferenceEntity> current = repository.findPreferences(userId);
        List<PreferenceEntity> kept = current.stream()
                .filter(p -> !removed.contains(p.getLegendId())).toList();
        if (kept.size() == current.size()) {
            return;
        }
        repository.deleteAllPreferences(userId);
        for (int i = 0; i < kept.size(); i++) {
            repository.insertPreference(userId, kept.get(i).getLegendId(), i + 1);
        }
    }

    /** 다른 기기에서 먼저 저장했다면 409. 기록이 아직 없으면 서버 값도 클라이언트 값도 null. */
    private void checkVersion(Long userId, String clientVersion) {
        LocalDateTime latest = repository.findLatestUpdatedAt(userId);
        String server = latest == null ? null : latest.toString();
        String client = (clientVersion == null || clientVersion.isBlank()) ? null : clientVersion;
        if (!Objects.equals(server, client)) {
            throw new BaseException(LEGEND_COLLECTION_VERSION_CONFLICT, HttpStatus.CONFLICT);
        }
    }

    private static BaseException bad(Enum<?> code) {
        return new BaseException(code, HttpStatus.BAD_REQUEST);
    }

    private static <T> List<T> orEmpty(List<T> list) {
        return list == null ? List.of() : list;
    }
}
