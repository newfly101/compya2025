package com.dawne.com2usbaseball.domain.legendCollectionSkill.service.support;

import com.dawne.com2usbaseball.common.support.exception.BaseException;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.response.LegendSkillResponse.SlotItem;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.dto.response.LegendSkillResponse.Usage;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillAction;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillKind;
import com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.SkillTier;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;

import static com.dawne.com2usbaseball.domain.legendCollectionSkill.enums.LegendCollectionSkillMessages.*;

/** 강화 계산·활성 규칙 (REQ-LCSK-04/06/10/11). DB 를 모른다. */
public final class SkillRules {

    public static final int BASE_LIMIT = 7;
    public static final SlotItem EMPTY = new SlotItem(null, null, null);

    /** 로그에서 읽은 진행 상태. bulkMode 는 null | "NO_GGG" | "S". */
    public record Progress(Usage usage, String bulkMode) {
        public int enhanceCount() {
            return usage.base() + usage.gcg() + usage.ggg();
        }
    }

    private SkillRules() {
    }

    /** 레전드·노말·히어로 A, 플래티넘 S. */
    public static SkillTier cap(SkillKind kind) {
        return kind == SkillKind.PLATINUM ? SkillTier.S : SkillTier.A;
    }

    /** 일괄 적용 목표 등급. */
    public static SkillTier bulkTarget(SkillAction action, SkillKind kind) {
        return switch (kind) {
            case LEGEND -> action == SkillAction.BULK_S ? SkillTier.S : SkillTier.A;
            case PLATINUM -> SkillTier.S;
            default -> SkillTier.A;
        };
    }

    /**
     * 로그(id 순) → 진행 상태. 사용량·일괄 표식 모두 마지막 SAVE·UNDO·RESET 이후
     * (되돌리기는 일괄 적용도 해제한다).
     */
    public static Progress progress(List<SkillAction> actions) {
        int base = 0, gcg = 0, ggg = 0;
        String bulk = null;
        for (SkillAction a : actions) {
            switch (a) {
                case BASE_UP -> base++;
                case GCG_UP -> gcg++;
                case GGG_UP -> ggg++;
                case BULK_S -> bulk = "S";
                case BULK_NO_GGG -> bulk = "NO_GGG";
                case SAVE, UNDO, RESET -> {
                    base = gcg = ggg = 0;
                    bulk = null;
                }
            }
        }
        return new Progress(new Usage(base, gcg, ggg), bulk);
    }

    /**
     * 일괄 상태면 사용량을 슬롯 상태(등록→현재)로 계산한다.
     * 기본 강화 7회를 먼저 쓰고 나머지는 고추강, 레전드 A→S 는 고고각.
     * kinds 는 슬롯과 같은 순서(null 허용).
     */
    public static Progress withBulkUsage(Progress p, List<SlotItem> slots, List<SkillKind> kinds) {
        if (p.bulkMode() == null) {
            return p;
        }
        int steps = 0, ggg = 0;
        for (int i = 0; i < slots.size() && i < kinds.size(); i++) {
            SlotItem s = slots.get(i);
            SkillKind kind = kinds.get(i);
            if (s.skillId() == null || kind == null) {
                continue;
            }
            int top = Math.min(s.currentGrade().ordinal(), cap(kind).ordinal());
            steps += Math.max(0, top - s.baseGrade().ordinal());
            if (kind == SkillKind.LEGEND && s.currentGrade() == SkillTier.S) {
                ggg++;
            }
        }
        int base = Math.min(steps, BASE_LIMIT);
        return new Progress(new Usage(base, steps - base, ggg), p.bulkMode());
    }

    /** 활성 규칙을 다시 검사하고 새 슬롯 상태를 돌려준다. kinds 는 슬롯과 같은 순서. */
    public static List<SlotItem> apply(SkillAction action, Integer slot, List<SlotItem> slots,
                                       List<SkillKind> kinds, Progress p) {
        List<SlotItem> next = new ArrayList<>(slots);
        switch (action) {
            case RESET -> {
                return List.of(EMPTY, EMPTY, EMPTY);
            }
            case UNDO -> {
                requireRegistered(slots);
                next.replaceAll(s -> new SlotItem(s.skillId(), s.baseGrade(), s.baseGrade()));
            }
            case BULK_S, BULK_NO_GGG -> {
                requireRegistered(slots);
                // 모든 슬롯이 이미 목표 이상이면 거부
                boolean reached = true;
                for (int i = 0; i < 3; i++) {
                    reached &= slots.get(i).currentGrade().ordinal() >= bulkTarget(action, kinds.get(i)).ordinal();
                }
                if (reached) {
                    throw bad(LEGEND_COLLECTION_SKILL_ACTION_NOT_ALLOWED);
                }
                for (int i = 0; i < 3; i++) {
                    next.set(i, new SlotItem(slots.get(i).skillId(), slots.get(i).baseGrade(), bulkTarget(action, kinds.get(i))));
                }
            }
            case BASE_UP, GCG_UP, GGG_UP -> {
                requireRegistered(slots);
                int i = slotIndex(slot);
                SlotItem s = slots.get(i);
                SkillKind kind = kinds.get(i);
                boolean ok = switch (action) {
                    case BASE_UP -> p.bulkMode() == null && p.usage().base() < BASE_LIMIT
                            && s.currentGrade().ordinal() < cap(kind).ordinal();
                    case GCG_UP -> p.bulkMode() == null && p.usage().base() == BASE_LIMIT
                            && s.currentGrade().ordinal() < cap(kind).ordinal();
                    default -> kind == SkillKind.LEGEND && s.currentGrade() == SkillTier.A;
                };
                if (!ok) {
                    throw bad(LEGEND_COLLECTION_SKILL_ACTION_NOT_ALLOWED);
                }
                SkillTier to = action == SkillAction.GGG_UP ? SkillTier.S : s.currentGrade().next();
                next.set(i, new SlotItem(s.skillId(), s.baseGrade(), to));
            }
            default -> throw bad(LEGEND_COLLECTION_SKILL_ACTION_NOT_ALLOWED);
        }
        return next;
    }

    private static void requireRegistered(List<SlotItem> slots) {
        if (slots.stream().anyMatch(s -> s.skillId() == null)) {
            throw bad(LEGEND_COLLECTION_SKILL_NOT_REGISTERED);
        }
    }

    private static int slotIndex(Integer slot) {
        if (slot == null || slot < 1 || slot > 3) {
            throw bad(LEGEND_COLLECTION_SKILL_INVALID_SLOTS);
        }
        return slot - 1;
    }

    private static BaseException bad(Enum<?> code) {
        return new BaseException(code, HttpStatus.BAD_REQUEST);
    }
}
