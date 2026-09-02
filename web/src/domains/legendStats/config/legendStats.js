// domains/legendStats/config/legendStats.js
// 레전드 재료 화면(v2)이 쓰는 상수와 순수 함수.
//
// 파생값(OVR·정파선·주수·제/구)은 저장하지 않고 매 렌더 계산한다 — 저장하면 스탯이
// 바뀔 때 어긋난다. 구단 한글명·구종 표시명은 별도 요청이라 조립은 훅에서 한다.

export const ALL = "전체";

export const TYPE_FILTERS = [ALL, "타자", "투수"];

export const BAT_KEYS = ["정확", "파워", "선구", "주력", "수비"];
export const PIT_KEYS = ["제구", "구위", "체력", "직구", "변화"];

export const BAT_ABBR = { 정확: "정", 파워: "파", 선구: "선", 주력: "주", 수비: "수" };
export const PIT_ABBR = { 제구: "제", 구위: "구", 체력: "체", 직구: "직", 변화: "변" };

// 데이터에 존재하는 것만 칩으로 노출한다
export const BAT_POS_ORDER = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
// 투수 보직은 데이터와 무관하게 3종 고정
export const PIT_POS = ["SP", "RP", "CP"];

// 스탯 셀 강조 기준
export const STAT_HI = 76;
export const STAT_LO = 66;

// 키는 구단 한글 약칭 (teamNameByCode 를 거친 값)
export const TEAM_COLOR = {
  삼성: "#2a6fd6",
  두산: "#4b63b8",
  LG: "#e0245e",
  KIA: "#ef3340",
  롯데: "#3d7fd6",
  키움: "#b4324e",
  SSG: "#e0384f",
  NC: "#4f7fbf",
  한화: "#f97316",
  kt: "#9aa0aa",
  KT: "#9aa0aa",
};

export const teamColor = (team) => TEAM_COLOR[team] ?? "#888888";

/* ── 파생값 ───────────────────────────────────────────────────────── */

export const ovr = (legend) => {
  const values = Object.values(legend.stats);
  return values.reduce((a, b) => a + b, 0) / values.length;
};

export const batSummary = (legend) => ({
  정파선: legend.stats.정확 + legend.stats.파워 + legend.stats.선구,
  주수: legend.stats.주력 + legend.stats.수비,
});

export const pitSummary = (legend) => ({ 제구위: legend.stats.제구 + legend.stats.구위 });

/** 구종 수치가 하나라도 있으면 그 평균, 전부 미확인이면 null */
export const pitchAverage = (pitches) => {
  const nums = Object.values(pitches ?? {})
    .map((p) => p.val)
    .filter((v) => v != null);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

/* ── 필터 · 정렬 ──────────────────────────────────────────────────── */

/** 소속 인원이 많은 구단부터. 맨 앞은 항상 전체 */
export const teamOptions = (legends) => {
  const count = new Map();
  legends.forEach((l) => count.set(l.team, (count.get(l.team) ?? 0) + 1));
  return [ALL, ...[...count.keys()].sort((a, b) => count.get(b) - count.get(a))];
};

/** 타입이 전체면 빈 배열 — 타자/투수 포지션 체계가 달라 섞으면 의미가 없다 */
export const posOptions = (legends, type) => {
  if (type === ALL) return [];
  if (type === "투수") return [ALL, ...PIT_POS];
  const owned = new Set();
  legends.filter((l) => l.type === "타자").forEach((l) => l.pos.forEach((p) => owned.add(p)));
  return [ALL, ...BAT_POS_ORDER.filter((p) => owned.has(p))];
};

/** 타입에 따라 스탯 컬럼 자체가 교체된다 */
export const columns = (type) => {
  const base = [
    { key: "rank", label: "#", cls: "cRank", sticky: true, sortable: false },
    { key: "score", label: "평점", cls: "cScore", sticky: true, sortable: true },
    { key: "name", label: "레전드", cls: "cName", sticky: true, sortable: true },
    { key: "pos", label: "포지션", cls: "cPos", sortable: false },
    { key: "ovr", label: "OVR", cls: "cOvr", sortable: true },
  ];
  const statKeys = type === "타자" ? BAT_KEYS : type === "투수" ? PIT_KEYS : [];
  const abbr = type === "타자" ? BAT_ABBR : PIT_ABBR;
  statKeys.forEach((k) => base.push({ key: k, label: abbr[k], cls: "cStat", sortable: true }));
  return base;
};

const sortValue = (legend, key) => {
  if (key === "score") return legend.score;
  if (key === "ovr") return ovr(legend);
  if (key === "name") return legend.name;
  return legend.stats[key];
};

/**
 * 평점 미정은 정렬 방향과 무관하게 항상 맨 아래. 동점 tie-break 는 OVR 내림차순.
 * 검색은 레전드 이름에만 건다 — 구단은 위 칩으로 고르는 값이라 중복이다.
 */
export const visibleRows = (legends, { team, type, pos, query = "", sort, dir }) => {
  const q = query.trim().toLowerCase();
  const rows = legends.filter(
    (l) =>
      (!q || l.name.toLowerCase().includes(q)) &&
      (team === ALL || l.team === team) &&
      (type === ALL || l.type === type) &&
      (type === ALL || pos === ALL || l.pos.includes(pos)),
  );

  return [...rows].sort((a, b) => {
    if (a.score == null && b.score == null) return ovr(b) - ovr(a);
    if (a.score == null) return 1;
    if (b.score == null) return -1;

    const av = sortValue(a, sort);
    const bv = sortValue(b, sort);
    if (typeof av === "string" || typeof bv === "string") {
      const cmp = String(av).localeCompare(String(bv), "ko");
      return (dir < 0 ? -cmp : cmp) || ovr(b) - ovr(a);
    }
    return (bv - av) * (dir < 0 ? 1 : -1) || ovr(b) - ovr(a);
  });
};

export const statTone = (value) => (value >= STAT_HI ? "hi" : value <= STAT_LO ? "lo" : "");

export const sortLabel = (sort) => ({ score: "평점", ovr: "OVR", name: "이름" })[sort] ?? sort;

/* ── 서버 응답 → 화면 모델 ────────────────────────────────────────── */

export const LEGEND_TYPE_LABEL = {
  NORMAL: "일반",
  NEW: "신규",
  LIVING: "LIVING",
  NATIONAL: "국가대표",
};

export const ROLE_LABEL = { HITTER: "타자", PITCHER: "투수" };

// stats 배열의 슬롯 의미는 playerRole 이 정한다 (BE PlayerStatLabel 과 1:1)
const STAT_KEYS_BY_ROLE = { HITTER: BAT_KEYS, PITCHER: PIT_KEYS };

/**
 * GET /api/teams → { [teamCode]: 약칭 }.
 * 같은 teamCode 가 여러 행(팀명 변경 이력)일 수 있어 startYear 가 큰 행을 채택하고,
 * 정식 명칭(`삼성 라이온즈`)은 표가 좁아 첫 토큰만 쓴다.
 */
export const buildTeamNameByCode = (teams) => {
  const best = new Map();
  for (const t of teams ?? []) {
    if (!t?.teamCode) continue;
    const startYear = t.startYear ?? -Infinity;
    const prev = best.get(t.teamCode);
    if (!prev || startYear > prev.startYear) best.set(t.teamCode, { name: t.teamName, startYear });
  }
  return Object.fromEntries(
    [...best].map(([code, v]) => [code, String(v.name ?? "").split(" ")[0] || code]),
  );
};

export const buildPitchNameByCode = (pitchTypes) =>
  Object.fromEntries((pitchTypes ?? []).map((t) => [t.pitchCode, t.pitchName]));

/**
 * 서버 응답 1건 → 화면 모델.
 * lookup 이 비어 있어도 코드값을 그대로 표시하며 화면은 살아 있어야 한다.
 */
export const toLegendStatModel = (item, { teamNameByCode = {}, pitchNameByCode = {} } = {}) => {
  const statKeys = STAT_KEYS_BY_ROLE[item.playerRole] ?? BAT_KEYS;
  const stats = Object.fromEntries(statKeys.map((k, i) => [k, item.stats?.[i] ?? 0]));

  // val(구종 수치)은 아직 수집 대상이 아니다. 등급만 아는 구종은 grade 로 표시한다
  const pitches = item.pitches
    ? Object.fromEntries(
        item.pitches.map((p) => [
          pitchNameByCode[p.pitchCode] ?? p.pitchCode,
          { val: null, grade: p.pitchGrade },
        ]),
      )
    : undefined;

  return {
    id: item.id,
    name: item.legendName,
    type: ROLE_LABEL[item.playerRole] ?? item.playerRole,
    grade: LEGEND_TYPE_LABEL[item.legendType] ?? item.legendType,
    team: teamNameByCode[item.teamCode] ?? item.teamCode,
    pos: item.positions ?? [],
    score: item.rating == null ? null : Number(item.rating),
    stats,
    ...(pitches ? { pitches } : {}),
  };
};

/** GET /api/legends/{id} → 상세 패널의 재료·코치. 선수는 `호세'01`, 코치는 연도만. */
export const toMaterialModel = (detail, teamNameByCode = {}) => {
  const mats = [];
  const coaches = [];
  for (const m of detail?.materials ?? []) {
    const team = teamNameByCode[m.teamCode] ?? m.teamCode;
    if (m.materialType === "COACH") coaches.push({ team, year: m.seasonYear });
    else mats.push({ team, name: `${m.playerName}'${String(m.seasonYear).slice(-2)}` });
  }
  return { mats, coaches };
};

/**
 * 평점 출처.
 * 게임 내 수치가 아니라 특정 유저가 분석해 산정한 값이고, 원작자에게 사용 허락을
 * 받은 조건이 출처 표기다. 표에 근거를 남겨야 해서 화면에 노출한다.
 */
export const RATING_SOURCE = {
  author: "리룬지우",
  site: "네이버 카페",
  url: "https://naver.me/5YoRLA75",
};

/**
 * 재료 카드에 붙는 배지 안내.
 * 마일리지는 아직 데이터가 없어 배지가 실제로 붙지 않는다 — 설명만 먼저 둔다.
 */
export const BADGE_GUIDE = [
  { mark: "히", tone: "history", label: "히스토리 모드에서 저격 가능", note: null },
  { mark: "마", tone: "mileage", label: "마일리지로 저격 가능", note: "업데이트 예정" },
];
