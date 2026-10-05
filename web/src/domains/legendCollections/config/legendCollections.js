// legendCollections 순수 함수 · 상수. 서버 통신 없음.
// 상태 값은 서버와 같다: 재료 NONE/HAVE/INSERTED, 레전드 NONE/FRAME/OWNED.

import { getTodayKst } from "../../../global/utils/datetime/dateUtils.js";

export const MATERIAL = { NONE: "NONE", HAVE: "HAVE", INSERTED: "INSERTED" };
export const LEGEND = { NONE: "NONE", FRAME: "FRAME", OWNED: "OWNED" };

export const MAX_PREFERENCES = 10;
export const SLOT_COUNT = 8;

export const FRAME_FILTERS = ["전체", "액자 O", "액자 X"];
/** 액자 칩 줄의 4번째 칩(로그인 시만) — 선호 레전드만 순위대로 */
export const PREF_FILTER = "내 선호";

// 히스토리 모드 14일 주기 — 기준일 2026-09-28(월) = 1일차 (REQ-LCOL-19)
const BASE_UTC_DAY = Date.UTC(2026, 8, 28) / 86400000;
const CYCLE = 14;

/** KST 오늘의 (연,월,일) 을 UTC 자정 기준 일수로 — 브라우저 시간대와 무관 */
const kstDayNumber = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [y, m, d] = parts.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86400000;
};

/** 오늘 일차 1~14 */
export const todayDayNo = (now = new Date()) => {
  const diff = kstDayNumber(now) - BASE_UTC_DAY;
  return ((diff % CYCLE) + CYCLE) % CYCLE + 1;
};

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

/** 이번 주기의 dayNo 일차 날짜 → "9/29 (화)" (KST) */
export const cycleDateLabel = (dayNo, now = new Date(), compact = false) => {
  const start = kstDayNumber(now) - (todayDayNo(now) - 1);
  const d = new Date((start + dayNo - 1) * 86400000);
  const md = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return compact ? md : `${md} (${DOW[d.getUTCDay()]})`;
};

/** 오늘 날짜 → "9/29(화)" (KST) */
export const todayLabel = (now = new Date()) => cycleDateLabel(todayDayNo(now), now).replace(" ", "");

/** 이번 주기 범위 → "9/28 ~ 10/11" */
export const cycleRangeLabel = (now = new Date()) =>
  `${cycleDateLabel(1, now, true)} ~ ${cycleDateLabel(CYCLE, now, true)}`;

/** GET /legends/{id} 재료 → 칸 목록. 선수 6 + 코치 2, 재료 id 가 기록의 열쇠 */
export const toSlots = (detail, teamNameByCode = {}) =>
  [...(detail?.materials ?? [])]
    .sort((a, b) => (a.slotNo ?? 0) - (b.slotNo ?? 0))
    .map((m) => {
      const team = teamNameByCode[m.teamCode] ?? m.teamCode;
      const coach = m.materialType === "COACH";
      return {
        id: m.id,
        coach,
        team,
        teamCode: m.teamCode,
        label: coach ? `${m.seasonYear} 코치` : `${m.playerName}'${String(m.seasonYear).slice(-2)}`,
        cardId: m.playerCardId,
      };
    });

/* ── 초안(draft) — 서버 값 위에 덮어쓴 것만 담는다 ─────────────────── */

// dates: 상태를 바꾼 레전드의 획득일 { legendId: "yyyy-MM-dd" } — 안 고르면 저장 때 오늘
export const EMPTY_DRAFT = { legends: {}, materials: {}, resets: [], dates: {} };

export const legendStatus = (legendId, server, draft) =>
  draft.legends[legendId] ?? server.legends[legendId] ?? LEGEND.NONE;

/** 칸 표시 상태 — 보유중 레전드는 0/8 로 본다 */
export const materialState = (legendId, materialId, server, draft) => {
  if (legendStatus(legendId, server, draft) === LEGEND.OWNED) return MATERIAL.NONE;
  return draft.materials[materialId] ?? server.materials[materialId] ?? MATERIAL.NONE;
};

/** 저장된 삽입 = 서버 값이 INSERTED 이고 이 레전드를 초기화하지 않은 것 */
export const isLockedInsert = (legendId, materialId, server, draft) =>
  server.materials[materialId] === MATERIAL.INSERTED && !draft.resets.includes(legendId);

/** 허용 전환(REQ-LCOL-03). 저장 전 삽입은 다른 칸으로 되돌릴 수 있다 */
export const canSetMaterial = (legendId, materialId, next, server, draft) => {
  if (legendStatus(legendId, server, draft) === LEGEND.OWNED) return false;
  if (isLockedInsert(legendId, materialId, server, draft)) return false;
  const cur = materialState(legendId, materialId, server, draft);
  if (cur === next) return false;
  if (next === MATERIAL.INSERTED) return cur === MATERIAL.HAVE;
  return true;
};

const dropIfSame = (map, key, value, base) => {
  const next = { ...map };
  if (value === base) delete next[key];
  else next[key] = value;
  return next;
};

export const setMaterial = (draft, server, materialId, next) => ({
  ...draft,
  materials: dropIfSame(draft.materials, materialId, next, server.materials[materialId] ?? MATERIAL.NONE),
});

// 상태를 바꾸면 이전에 고른 획득일은 버린다 (새 상태 기준으로 다시 고르거나 오늘)
export const setLegendStatus = (draft, server, legendId, next) => {
  const dates = { ...draft.dates };
  delete dates[legendId];
  return {
    ...draft,
    legends: dropIfSame(draft.legends, legendId, next, server.legends[legendId] ?? LEGEND.NONE),
    dates,
  };
};

export const setLegendDate = (draft, legendId, date) => ({ ...draft, dates: { ...draft.dates, [legendId]: date } });

/** 획득일 열 값 — 보유중→acquiredAt, 액자→frameAcquiredAt, 없으면 null. 저장된 상태 기준 */
export const displayAcquiredDate = (legendId, server) => {
  const st = server.legends[legendId];
  if (st === LEGEND.OWNED) return server.acquiredAt?.[legendId] ?? null;
  if (st === LEGEND.FRAME) return server.frameAcquiredAt?.[legendId] ?? null;
  return null;
};

/** "2026-10-02" → "26.10.02", 없으면 "-" */
export const shortDate = (date) => (date ? `${date.slice(2, 4)}.${date.slice(5, 7)}.${date.slice(8, 10)}` : "-");

/** 재료 8칸만 미보유로, 레전드 상태는 유지 (REQ-LCOL-11) */
export const resetMaterials = (draft, server, legendId, materialIds) => {
  const materials = { ...draft.materials };
  materialIds.forEach((id) => {
    if ((server.materials[id] ?? MATERIAL.NONE) === MATERIAL.NONE) delete materials[id];
    else materials[id] = MATERIAL.NONE;
  });
  const resets = draft.resets.includes(legendId) ? draft.resets : [...draft.resets, legendId];
  return { ...draft, materials, resets };
};

export const changeCount = (draft) =>
  Object.keys(draft.legends).length + Object.keys(draft.materials).length + draft.resets.length;

export const hasInsertChange = (draft) =>
  Object.values(draft.materials).some((s) => s === MATERIAL.INSERTED);

/** PUT /changes 본문 — 액자·보유중으로 바꾼 레전드에는 acquiredOn(고른 날짜, 없으면 today) */
export const buildChangesBody = (draft, version, today = getTodayKst()) => ({
  version,
  materials: Object.entries(draft.materials).map(([materialId, state]) => ({ materialId, state })),
  legends: Object.entries(draft.legends).map(([legendId, status]) =>
    status === LEGEND.NONE ? { legendId, status } : { legendId, status, acquiredOn: draft.dates?.[legendId] || today },
  ),
  resetLegendIds: draft.resets,
});

/* ── 집계 ─────────────────────────────────────────────────────────── */

/** 레전드 하나의 보유(보유+삽입) 칸 수 — 보유중 레전드는 0. 펼치지 않은 레전드도 센다 */
export const ownedCount = (legendId, server, draft) => {
  if (legendStatus(legendId, server, draft) === LEGEND.OWNED) return 0;
  const ids = new Set([...Object.keys(server.materials), ...Object.keys(draft.materials)]);
  let n = 0;
  ids.forEach((id) => {
    if (String(server.materialLegend[id]) !== String(legendId)) return;
    if ((draft.materials[id] ?? server.materials[id]) !== MATERIAL.NONE) n += 1;
  });
  return n;
};

/** 레전드 하나의 { inserted, have, left } — 진행 막대·"삽입 n · 보유 n · 남은 n칸" 용. 보유중이면 0/8 */
export const legendCounts = (legendId, server, draft) => {
  let inserted = 0;
  let have = 0;
  if (legendStatus(legendId, server, draft) !== LEGEND.OWNED) {
    const ids = new Set([...Object.keys(server.materials), ...Object.keys(draft.materials)]);
    ids.forEach((id) => {
      if (String(server.materialLegend[id]) !== String(legendId)) return;
      const s = draft.materials[id] ?? server.materials[id];
      if (s === MATERIAL.INSERTED) inserted += 1;
      if (s === MATERIAL.HAVE) have += 1;
    });
  }
  return { inserted, have, left: SLOT_COUNT - inserted - have };
};

/** 초안에 새로 들어간 삽입 칸 수 — 삽입 저장 확인창 문구 */
export const insertChangeCount = (draft) =>
  Object.values(draft.materials).filter((s) => s === MATERIAL.INSERTED).length;

/** 상단 요약 — 액자 n · 재료 보유 n · 삽입 n. 보유중 레전드의 재료는 0 으로 본다 */
export const summarize = (legends, server, draft) => {
  let frame = 0;
  let owned = 0;
  let inserted = 0;
  const counted = new Set(); // 목록에 든, 보유중이 아닌 레전드만 센다 (내 목표 편집은 선호 레전드만)
  legends.forEach((l) => {
    const st = legendStatus(l.id, server, draft);
    if (st === LEGEND.FRAME) frame += 1;
    if (st !== LEGEND.OWNED) counted.add(String(l.id));
  });
  const ids = new Set([...Object.keys(server.materials), ...Object.keys(draft.materials)]);
  ids.forEach((id) => {
    if (!counted.has(String(server.materialLegend[id]))) return;
    const s = draft.materials[id] ?? server.materials[id];
    if (s === MATERIAL.HAVE) owned += 1;
    if (s === MATERIAL.INSERTED) inserted += 1;
  });
  return { count: legends.length, frame, owned, inserted };
};

export const matchFrameFilter = (status, filter) => {
  if (filter === "액자 O") return status === LEGEND.FRAME;
  if (filter === "액자 X") return status !== LEGEND.FRAME;
  return true;
};

/** 기본 정렬: 보유중이 아닌 레전드 중 보유 칸이 많은 순, 보유중은 뒤 */
export const sortByProgress = (legends, countOf, statusOf) =>
  [...legends].sort((a, b) => {
    const ao = statusOf(a) === LEGEND.OWNED ? 1 : 0;
    const bo = statusOf(b) === LEGEND.OWNED ? 1 : 0;
    if (ao !== bo) return ao - bo;
    return countOf(b) - countOf(a) || a.name.localeCompare(b.name, "ko");
  });

/* ── 표 머리 정렬 — 레전드 · 상태 · 선호 · 획득일 · 보유 (# 는 정렬 없음) ───────────── */

export const SORT = { OWNED: "owned", NAME: "name", STATUS: "status", DATE: "date", PREF: "pref" };

/** 획득일 비교 — 날짜 없음(null)은 방향과 무관하게 항상 뒤, 같으면 0(안정 정렬이 기존 순서 유지). dir 1 오름 · -1 내림 */
export const compareDates = (a, b, dir) => {
  if (!a || !b) return !a && !b ? 0 : !a ? 1 : -1;
  return a === b ? 0 : dir * (a < b ? -1 : 1);
};

/** 상태 정렬은 3단계 순환 — 머리를 누를 때마다 미보유 먼저 → 액자 먼저 → 보유중 먼저 → … (원형 회전). sort.first = 맨 앞에 오는 상태 */
const STATUS_CYCLE = [LEGEND.NONE, LEGEND.FRAME, LEGEND.OWNED];
const STATUS_FIRST_TEXT = { [LEGEND.NONE]: "미보유 먼저", [LEGEND.FRAME]: "액자 먼저", [LEGEND.OWNED]: "보유중 먼저" };

/** 기본값 = 기존 기본 정렬 (모은 칸 많은 순). dir: 1 오름차순 · -1 내림차순 */
export const DEFAULT_SORT = { key: SORT.OWNED, dir: -1 };
/** 선호 레전드만 볼 때(내 목표 칩) 기본 — 선호 순위 */
export const PREF_SORT = { key: SORT.PREF, dir: 1 };

/** 머리를 눌렀을 때의 다음 정렬. 같은 머리를 다시 누르면 방향을 돌린다. 처음 누르는 방향: 이름·선호 오름, 나머지 내림 */
export const nextSort = (cur, key) => {
  if (key === SORT.STATUS) {
    const i = cur?.key === key ? STATUS_CYCLE.indexOf(cur.first) + 1 : 0;
    return { key, dir: -1, first: STATUS_CYCLE[i % 3] }; // dir -1 = 머리 표시(▼) 고정용
  }
  if (cur?.key === key) return { ...cur, dir: -cur.dir };
  return { key, dir: key === SORT.NAME || key === SORT.PREF ? 1 : -1 };
};

/** 머리 글자 옆 표시 — 정렬 중인 머리만 ▲▼ */
export const sortMark = (sort, key) => {
  if (!sort || sort.key !== key) return "";
  return sort.dir < 0 ? "▼" : "▲";
};

const SORT_TEXT = {
  [SORT.OWNED]: ["보유 적은 순", "보유 많은 순"],
  [SORT.NAME]: ["이름 오름차순", "이름 내림차순"],
  [SORT.DATE]: ["획득일 오래된 순", "획득일 최신순"],
  [SORT.PREF]: ["선호 순위순", "선호 낮은 순"],
};

/** 표 위 요약 줄 오른쪽에 쓰는 현재 정렬 기준 글자 — dir 1 오름 · -1 내림 */
export const sortText = (sort) => {
  if (!sort) return "";
  if (sort.key === SORT.STATUS) return STATUS_FIRST_TEXT[sort.first];
  return SORT_TEXT[sort.key][sort.dir < 0 ? 1 : 0];
};

/** 선호 열 글자 — rank 1~10 → "선호1", 없으면 "-" */
export const prefLabel = (rank) => (rank > 0 ? `선호${rank}` : "-");

/**
 * 표 머리 정렬. 보유중 레전드는 재료가 0/8 이라 "보유" 정렬에서는 어느 방향이든 뒤로 보낸다.
 * 같은 값끼리는 기본 정렬(보유 많은 순 → 이름) 을 따른다. prefOf(l) = 선호 순위(1~) 또는 0 — 선호 없는 행은 항상 뒤.
 */
export const sortLegends = (legends, sort, countOf, statusOf, dateOf, prefOf = () => 0) => {
  const byProgress = (a, b) => {
    const ao = statusOf(a) === LEGEND.OWNED ? 1 : 0;
    const bo = statusOf(b) === LEGEND.OWNED ? 1 : 0;
    return ao - bo || countOf(b) - countOf(a) || a.name.localeCompare(b.name, "ko");
  };
  const byName = (a, b) => a.name.localeCompare(b.name, "ko");
  return [...legends].sort((a, b) => {
    if (sort.key === SORT.NAME) return sort.dir * byName(a, b);
    if (sort.key === SORT.DATE) return compareDates(dateOf(a), dateOf(b), sort.dir);
    if (sort.key === SORT.PREF) {
      const pa = prefOf(a);
      const pb = prefOf(b);
      if (!pa || !pb) return !pa && !pb ? byProgress(a, b) : !pa ? 1 : -1;
      return sort.dir * (pa - pb);
    }
    if (sort.key === SORT.STATUS) {
      // first 부터 원형으로 센 순번 비교 — 같은 상태는 0(안정 정렬이 기존 순서 유지)
      const at = (l) => (STATUS_CYCLE.indexOf(statusOf(l)) - STATUS_CYCLE.indexOf(sort.first) + 3) % 3;
      return at(a) - at(b);
    }
    if (sort.dir < 0) return byProgress(a, b);
    const ao = statusOf(a) === LEGEND.OWNED ? 1 : 0;
    const bo = statusOf(b) === LEGEND.OWNED ? 1 : 0;
    return ao - bo || countOf(a) - countOf(b) || byName(a, b);
  });
};

/* ── 초안 보관 (sessionStorage) ───────────────────────────────────── */

const DRAFT_KEY = "legendCollections.draft.v1";

export const loadDraft = () => {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    return { legends: d.legends ?? {}, materials: d.materials ?? {}, resets: d.resets ?? [], dates: d.dates ?? {} };
  } catch {
    return null;
  }
};

export const saveDraft = (draft) => {
  try {
    if (changeCount(draft) === 0) sessionStorage.removeItem(DRAFT_KEY);
    else sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* 저장소를 못 쓰는 환경 — 화면 상태만으로 계속 */
  }
};

export const clearDraft = () => {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* noop */
  }
};

/** 선호 모달 저장 본문 — 순위는 1부터, 액자는 서버 값과 달라진 것만 */
export const buildPreferencesBody = (orderedIds, frameById, server, version) => ({
  version,
  preferences: orderedIds.map((legendId, i) => ({ legendId, rank: i + 1 })),
  frames: Object.entries(frameById)
    .filter(([legendId, frame]) => !!frame !== (server.legends[legendId] === LEGEND.FRAME))
    .map(([legendId, frame]) => ({ legendId, frame: !!frame })),
});

/** 일정 → 일차별 묶음 { dayNo, entries:[{legendName, cards[]}] } (선호 순위 유지) */
export const groupSchedule = (items, preferences) => {
  const byDay = new Map();
  items.forEach((i) => {
    if (!byDay.has(i.dayNo)) byDay.set(i.dayNo, new Map());
    const legends = byDay.get(i.dayNo);
    if (!legends.has(i.legendId)) legends.set(i.legendId, { legendId: i.legendId, legendName: i.legendName, cards: [] });
    legends.get(i.legendId).cards.push(i.card);
  });
  const rank = (id) => {
    const r = preferences.indexOf(id);
    return r < 0 ? 99 : r;
  };
  return [...byDay.keys()]
    .sort((a, b) => a - b)
    .map((dayNo) => ({
      dayNo,
      entries: [...byDay.get(dayNo).values()].sort((a, b) => rank(a.legendId) - rank(b.legendId)),
    }));
};
