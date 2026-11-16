// legendCollectionSkills 순수 함수 · 상수. 서버 통신 없음 (spec REQ-LCSK-04~06·10).
// 등급 E<D<C<B<A<S. 스킬 등급(skillGrade)은 "레전드·플래티넘·히어로·노말" 라벨 그대로 받는다.

export const GRADES = ["E", "D", "C", "B", "A", "S"];
export const REG_GRADES = ["E", "D", "C"]; // 등록 드롭다운 (REQ-LCSK-03)
export const BASE_LIMIT = 7;
export const SLOT_COUNT = 3;

export const ACTION = {
  BASE_UP: "BASE_UP",
  GCG_UP: "GCG_UP", // 고추강
  GGG_UP: "GGG_UP", // 고고각
  UNDO: "UNDO",
  RESET: "RESET",
  BULK_S: "BULK_S",
  BULK_NO_GGG: "BULK_NO_GGG",
};
export const BULK = { S: "S", NO_GGG: "NO_GGG" };

export const REG_FILTERS = ["전체", "등록", "미등록"];

const idx = (g) => GRADES.indexOf(g);
const isLegend = (skillGrade) => skillGrade === "레전드";

/** 고고각 없이 갈 수 있는 최대 — 플래티넘 S, 그 외 A */
export const maxNormal = (skillGrade) => (skillGrade === "플래티넘" ? "S" : "A");

const steps = (skillGrade, from) => Math.max(0, idx(maxNormal(skillGrade)) - idx(from));

/**
 * 풀업 필요 재화 (REQ-LCSK-05). slots: [{ baseGrade, skillGrade }] 3개.
 * 고고각 = 레전드 스킬 수, 고추강 = max(0, 단계 합 − 7).
 */
export const calcNeed = (slots) => ({
  ggg: slots.filter((s) => isLegend(s.skillGrade)).length,
  gcg: Math.max(0, slots.reduce((sum, s) => sum + steps(s.skillGrade, s.baseGrade), 0) - BASE_LIMIT),
});

// 슬롯 하나가 그 강화를 받을 수 있나
const SLOT_RULE = {
  [ACTION.BASE_UP]: (s) => idx(s.currentGrade) < idx(maxNormal(s.skillGrade)),
  [ACTION.GCG_UP]: (s) => idx(s.currentGrade) < idx(maxNormal(s.skillGrade)),
  [ACTION.GGG_UP]: (s) => isLegend(s.skillGrade) && s.currentGrade === "A",
};
export const slotCanTake = (action, slot) => SLOT_RULE[action]?.(slot) ?? false;

/** 강화 버튼 3개의 활성 (REQ-LCSK-06·10). slots: [{ currentGrade, skillGrade }] 3개 */
export const enhanceEnabled = (slots, usage, bulkMode) => {
  const any = (action) => slots.some((s) => slotCanTake(action, s));
  const noBase = bulkMode === BULK.NO_GGG || bulkMode === BULK.S;
  return {
    [ACTION.BASE_UP]: !noBase && usage.base < BASE_LIMIT && any(ACTION.BASE_UP),
    [ACTION.GCG_UP]: !noBase && usage.base >= BASE_LIMIT && any(ACTION.GCG_UP),
    [ACTION.GGG_UP]: bulkMode !== BULK.S && any(ACTION.GGG_UP),
  };
};

/** 일괄 버튼 활성 — 현재 등급이 목표에 못 미친 슬롯이 하나라도 있을 때. kind: BULK.S(레전드도 S) | BULK.NO_GGG(레전드 A). slots: [{ currentGrade, skillGrade }] */
export const bulkEnabled = (kind, slots) =>
  slots.some((s) => idx(s.currentGrade) < idx(kind === BULK.S && isLegend(s.skillGrade) ? "S" : maxNormal(s.skillGrade)));

const USAGE_KEY = { [ACTION.BASE_UP]: "base", [ACTION.GCG_UP]: "gcg", [ACTION.GGG_UP]: "ggg" };

/**
 * 서버 항목 + 저장 전 대기 목록 → 화면에 보일 슬롯·사용량·강화 횟수 (서버 호출 없음).
 * actions: [{ action, slot(1~3) }] 순서대로 적용, 받을 수 없는 항목은 건너뛴다. skillGradeOf: skillId → 스킬 등급 라벨
 */
export const applyActions = (item, actions, skillGradeOf) => {
  const slots = item.slots.map((s) => ({ ...s }));
  const usage = { ...item.usage };
  let enhanceCount = item.enhanceCount;
  for (const { action, slot } of actions) {
    const s = slots[slot - 1];
    if (!s || !slotCanTake(action, { currentGrade: s.currentGrade, skillGrade: skillGradeOf(s.skillId) })) continue;
    s.currentGrade = GRADES[idx(s.currentGrade) + 1];
    usage[USAGE_KEY[action]] += 1;
    enhanceCount += 1;
  }
  return { slots, usage, enhanceCount };
};

/** 일괄 버튼·강화 버튼 노출 — 스킬 저장이 끝난(등록 상태, 초안 변경 없음) 보유중 레전드만 */
export const showEnhanceControls = (registered, enhanceable) => registered && enhanceable;

export const usageTotal = (usage) => usage.base + usage.gcg + usage.ggg;

/** 편집 잠금 — 서버 값만 본다 (강화 사용량 합 > 0 이거나 일괄 적용 상태). UNDO·RESET 응답이 풀면 곧바로 풀린다 */
// 강화 영역(강화 버튼·일괄 버튼·되돌리기)은 보유중만. 액자는 스킬 등록·초기화만 가능
export const canEnhance = (item) => item?.status === "OWNED";

/** 기본 정렬 — 보유중 먼저, 액자 뒤. 같은 상태 안에서는 기존 순서 유지(Array.sort 는 안정 정렬) */
export const sortByOwned = (rows) =>
  [...rows].sort((a, b) => (b.item.status === "OWNED") - (a.item.status === "OWNED"));
export const isEditLocked =(usage, bulkMode) => usageTotal(usage) > 0 || !!bulkMode;

// ── 목록 머리 정렬 (보유 현황 LegendTable 과 같은 방식: 머리 클릭, 같은 머리 다시 클릭하면 방향 반전) ──
export const SKSORT = { NAME: "name", ENH: "enh", STATUS: "status", REG: "reg" };
/** 기본 = 상태 · 보유중 먼저 (기존 sortByOwned 와 같은 결과) */
export const DEFAULT_SKSORT = { key: SKSORT.STATUS, dir: -1 };

/** 머리를 눌렀을 때 다음 정렬. 처음 누르는 방향: 이름 오름, 나머지 내림(강화 높은 순 · 보유중/등록 먼저) */
export const nextSkillSort = (cur, key) =>
  cur?.key === key ? { key, dir: -cur.dir } : { key, dir: key === SKSORT.NAME ? 1 : -1 };

/** 머리 글자 옆 표시 — 정렬 중인 머리만 ▲▼ */
export const skillSortMark = (sort, key) => (sort?.key !== key ? "" : sort.dir < 0 ? "▼" : "▲");

const SKSORT_TEXT = {
  [SKSORT.NAME]: ["이름 오름차순", "이름 내림차순"],
  [SKSORT.ENH]: ["강화 낮은 순", "강화 높은 순"],
  [SKSORT.STATUS]: ["상태 · 액자 먼저", "상태 · 보유중 먼저"],
  [SKSORT.REG]: ["등록여부 · 미등록 먼저", "등록여부 · 등록 먼저"],
};
/** 요약 줄 오른쪽 현재 정렬 기준 글자 */
export const skillSortText = (sort) => (sort ? SKSORT_TEXT[sort.key][sort.dir < 0 ? 1 : 0] : "");

// 강화 점수 = 3슬롯 현재 등급(E=0 … S=5) 합. 미등록은 null
const enhanceScore = (r) => (isRegistered(r.item.slots) ? r.item.slots.reduce((sum, s) => sum + idx(s.currentGrade), 0) : null);

/** 정렬 — 같은 값은 입력 순서 유지(안정). 강화는 미등록이 방향과 무관하게 항상 뒤. rows: [{ legend, item }] */
export const sortSkillRows = (rows, sort) => {
  const dir = sort.dir;
  const flag = {
    [SKSORT.STATUS]: (r) => (r.item.status === "OWNED" ? 1 : 0),
    [SKSORT.REG]: (r) => (isRegistered(r.item.slots) ? 1 : 0),
  }[sort.key];
  return [...rows].sort((a, b) => {
    if (sort.key === SKSORT.NAME) return dir * a.legend.name.localeCompare(b.legend.name, "ko");
    if (sort.key === SKSORT.ENH) {
      const x = enhanceScore(a);
      const y = enhanceScore(b);
      if (x === null || y === null) return x === y ? 0 : x === null ? 1 : -1;
      return dir * (x - y);
    }
    return dir * (flag(a) - flag(b));
  });
};

/** 등록 = 3칸 모두 스킬·태생 등급이 있다. 서버가 미등록에 칸마다 필드 null 객체를 줘도 미등록이다 */
export const isRegistered = (slots) =>
  Array.isArray(slots) && slots.length === SLOT_COUNT && slots.every((s) => s?.skillId != null && s?.baseGrade != null);

export const matchRegFilter = (registered, filter) =>
  filter === "전체" || (filter === "등록" ? registered : !registered);

const GRADE_KEY = { 레전드: "legend", 플래티넘: "platinum", 히어로: "hero", 노말: "normal" };

/** 스킬 등급 라벨 → 색 키. 모르는 값은 노말 */
export const gradeColorKey = (skillGrade) => GRADE_KEY[skillGrade] ?? "normal";

/** 목록 '강화' 열 — 미등록이면 null("-" 표기). 등록이면 3슬롯 현재 등급 글자·색 키·aria-label. skillById: Map<id, {name, grade}> */
export const enhanceSummary = (slots, skillById) => {
  if (!isRegistered(slots)) return null;
  const cells = slots.map((s) => {
    const sk = skillById.get(s.skillId);
    return { grade: s.currentGrade, key: gradeColorKey(sk?.grade), name: sk?.name ?? "" };
  });
  return {
    text: cells.map((x) => x.grade).join(""),
    cells,
    label: cells.map((x) => `${x.name} ${x.grade}`.trim()).join(", "),
  };
};

export const SKILL_GRADE_ORDER = ["레전드", "플래티넘", "히어로", "노말"];

// 추천 스킬(스킬명 기준, data_player_skill 표기와 동일) — 드롭다운에서 '추천' 뱃지 + 등급 안 맨 위
export const RECOMMENDED_SKILLS = {
  hitter: ["핵심타자", "베테랑", "대포군단", "스프레이 히터", "예지력", "슬러거", "배팅머신"],
  pitcher: ["팔색조", "베테랑", "투혼", "끝판왕", "언터처블"],
};

export const isRecommended = (s) => !!RECOMMENDED_SKILLS[s?.type]?.includes(s.name);

/** 스킬 드롭다운용 묶음 — 레전드→플래티넘→히어로→노말 순, 빈 묶음 제외. 묶음 안은 추천 스킬 먼저, 나머지는 입력 순서 유지. 모르는 등급은 노말에 합친다 */
export const groupSkillsByGrade = (skills) => {
  const known = (g) => (SKILL_GRADE_ORDER.includes(g) ? g : "노말");
  return SKILL_GRADE_ORDER.map((grade) => {
    const list = skills.filter((s) => known(s.grade) === grade);
    return { grade, key: gradeColorKey(grade), skills: [...list.filter(isRecommended), ...list.filter((s) => !isRecommended(s))] };
  }).filter((g) => g.skills.length);
};
