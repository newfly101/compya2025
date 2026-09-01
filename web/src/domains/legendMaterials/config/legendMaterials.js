// domains/legendMaterials/config/legendMaterials.js
// 레전드 재료 화면이 쓰는 상수와, 서버 응답 → 화면 모델 변환기.
//
// 데이터 자체는 서버에서 온다 — GET /api/legends?withMaterials=true
// (domains/legendMaterials/store/public/api.js)
// 구단 한글명은 GET /api/teams 로 따로 받는다 — 하드코딩 매핑 표를 두지 않는다.
// URL·내부 키에 쓰는 구단 식별자는 team_code 소문자(han, sam …)로 통일한다.

export const LEGEND_TYPE_LABEL = {
  NORMAL: "일반",
  NEW: "신규",
  LIVING: "리빙",
  NATIONAL: "국가대표",
};

export const ROLE_LABEL = {
  HITTER: "타자",
  PITCHER: "투수",
};

export const ROLE_FILTERS = [
  { key: "ALL", label: "전체" },
  { key: "HITTER", label: "타자" },
  { key: "PITCHER", label: "투수" },
];

export const OWNED_FILTERS = [
  { key: "ALL", label: "전체" },
  { key: "OWNED", label: "보유" },
  { key: "MISSING", label: "미보유" },
];

// 구단 도트 컬러 — 디자인 핸드오프 지정값. 칩 좌측 7px 도트에만 쓴다.
// 키는 team_code 소문자. 보유 카드 강조는 구단 컬러가 아니라 사이트 공통 브랜드 퍼플로 통일한다.
export const TEAM_COLOR = {
  sam: "#0B4EA2",
  doo: "#1B2A63",
  lg: "#C30452",
  kia: "#EA0029",
  lot: "#1E3A7B",
  kiw: "#8B1224",
  ssg: "#CE0E2D",
  nc: "#3A6EA5",
  han: "#FC4E00",
  kt: "#5A5A66",
};

// 칩 노출 순서 — 디자인 지정. 레전드가 없는 구단은 자동으로 빠진다.
const TEAM_ORDER = ["sam", "doo", "lg", "kia", "lot", "kiw", "ssg", "nc", "han", "kt"];

// 획득처 — 「히스토리모드」「마일리지저격」 컨텐츠 연동 시 재료에 source 필드로 채운다.
//   { type: "HISTORY", date: "2025-03-14", round: 12, order: 3 }
//   { type: "MILEAGE", year: 2011, team: "KIA", position: "SP" }
// 서버가 아직 이 값을 주지 않으므로 배지는 렌더되지 않는다.
export const SOURCE_META = {
  HISTORY: {
    label: "히스토리모드",
    desc: "아래 히스토리 회차에서 획득할 수 있습니다.",
    rows: (s) => [
      { k: "일자", v: s.date ?? "-" },
      { k: "회차", v: s.round != null ? `${s.round}회차` : "-" },
      { k: "등장 순서", v: s.order != null ? `${s.order}번째` : "-" },
    ],
  },
  MILEAGE: {
    label: "마일리지저격",
    desc: "마일리지 저격으로 획득할 수 있습니다.",
    rows: (s) => [
      { k: "연도", v: s.year ?? "-" },
      { k: "구단", v: s.team ?? "-" },
      { k: "포지션", v: s.position ?? "-" },
    ],
  },
};

/** 연도 2자리 (1995 → 95, 2005 → 05) */
export const shortYear = (year) => String(year).slice(-2);

// ── 재료 키 ──────────────────────────────────────────────────
// 보유 체크는 카드 단위다. 같은 카드가 여러 레전드의 재료로 쓰이면 보유 상태를 공유한다.
const materialKey = (m) =>
  m.materialType === "PLAYER"
    ? `P:${m.playerName}:${m.seasonYear}`
    : `C:${m.teamCode}:${m.seasonYear}`;

const toSlug = (name) => String(name).replace(/\s+/g, "");

/**
 * 서버 응답 1건 → 화면 모델(구조 변환만).
 * 구단 한글명은 아직 모른다 — teamCode/teamSlug 만 들고 있고,
 * 표시용 이름 조립은 withTeamNames() 에서 teams 조회 결과와 합쳐 처리한다.
 * 재료 정렬(선수 6 → 코치 2)은 서버가 이미 맞춰서 내려준다.
 */
export const toLegendModel = (item) => ({
  id: item.id,
  slug: toSlug(item.legendName),
  name: item.legendName,
  type: item.legendType,
  role: item.playerRole,
  position: item.positionCode,
  teamCode: item.teamCode,
  teamSlug: String(item.teamCode).toLowerCase(),
  materials: (item.materials ?? []).map((m) => ({
    key: materialKey(m),
    kind: m.materialType,
    teamCode: m.teamCode,
    teamSlug: String(m.teamCode).toLowerCase(),
    playerName: m.playerName,
    seasonYear: m.seasonYear,
    source: m.source ?? null,
  })),
});

// ── 구단 이름 조립 ───────────────────────────────────────────

/**
 * GET /api/teams 응답 → { [teamCode]: teamName } lookup.
 * 같은 teamCode 가 여러 행(팀명 변경 이력)일 수 있어 startYear 가 가장 큰 행을 채택한다.
 * startYear 가 없는 행은 최하위로 취급한다.
 */
/**
 * 표시용 약칭 — 서버는 정식 명칭(`삼성 라이온즈`)을 주는데
 * 칩과 재료 카드는 좁아서 그대로 쓰면 `삼성 라이온즈 '15 코치` 가 된다.
 *
 * fun_teams 20건 전부 첫 토큰이 곧 약칭이라 공백 앞만 취한다.
 * (KT wiz→KT, KIA 타이거즈→KIA, 쌍방울 레이더스→쌍방울 … 20/20 일치 확인)
 * 공백이 없으면 원문 그대로 둔다.
 */
const shortTeamName = (fullName) => String(fullName ?? "").split(" ")[0] || fullName;

export const buildTeamNameByCode = (teams) => {
  const best = new Map(); // teamCode -> { name, startYear }
  for (const t of teams ?? []) {
    if (!t?.teamCode) continue;
    const startYear = t.startYear ?? -Infinity;
    const prev = best.get(t.teamCode);
    if (!prev || startYear > prev.startYear) {
      best.set(t.teamCode, { name: t.teamName, startYear });
    }
  }
  return Object.fromEntries([...best].map(([code, v]) => [code, shortTeamName(v.name)]));
};

const teamNameOf = (teamCode, teamNameByCode) => teamNameByCode?.[teamCode] ?? teamCode;

/** 카드 이름 — 선수는 `마해영'01`, 코치는 `삼성 '02 코치` */
const materialLabel = (m, teamName) =>
  m.kind === "PLAYER"
    ? `${m.playerName}'${shortYear(m.seasonYear)}`
    : `${teamName} '${shortYear(m.seasonYear)} 코치`;

/**
 * 화면 모델(toLegendModel 결과) + 구단 이름 lookup → 표시용 모델.
 * teams 조회가 실패해 lookup 이 비어 있어도(teamNameByCode = {}) teamCode 를
 * 그대로(대문자) 표시하며 동작한다 — 이름을 못 받아도 화면은 살아 있어야 한다.
 */
export const withTeamNames = (legend, teamNameByCode) => {
  const team = teamNameOf(legend.teamCode, teamNameByCode);
  return {
    ...legend,
    team,
    materials: legend.materials.map((m) => {
      const mTeam = teamNameOf(m.teamCode, teamNameByCode);
      return {
        ...m,
        team: mTeam,
        name: materialLabel(m, mTeam),
      };
    }),
  };
};

// ── 목록 파생 ────────────────────────────────────────────────

/**
 * 레전드가 1명이라도 있는 구단만, 디자인 지정 순서로.
 * @param {Array} legends withTeamNames 를 거친 화면 모델 배열
 */
export const buildTeams = (legends) => {
  const counted = new Map();
  for (const l of legends) {
    if (!counted.has(l.teamSlug)) counted.set(l.teamSlug, { slug: l.teamSlug, name: l.team, count: 0 });
    counted.get(l.teamSlug).count += 1;
  }
  return TEAM_ORDER.filter((s) => counted.has(s)).map((s) => counted.get(s));
};

/** 구단 + 역할로 추린다. */
export const filterLegends = (legends, teamSlug, role = "ALL") =>
  legends.filter((l) => l.teamSlug === teamSlug && (role === "ALL" || l.role === role));

/** 요약행 메타 — `구분 · 구단 · 타입 · 포지션` */
export const legendMeta = (l) =>
  [LEGEND_TYPE_LABEL[l.type], l.team, ROLE_LABEL[l.role], l.position].filter(Boolean).join(" · ");
