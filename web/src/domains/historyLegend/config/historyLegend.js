// domains/historyLegend/config/historyLegend.js
// 히스토리 재료 탐색기가 쓰는 상수와 순수 함수.
//
// 재료 수·등장 일차·레전드별 필요 재료는 전부 로스터에서 계산한다. 저장하지 않는다.
// 레전드 메타(구단·타입·포지션)는 레전드 마스터에서 조인한다 — 여기 중복 저장 금지.

export const ALL = "전체";

export const VIEW = { LEGEND: "legend", ROUND: "round" };

export const BAT_POS = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];
export const PIT_POS = ["SP", "RP", "CP"];
const POS_ORDER = [...BAT_POS, ...PIT_POS];

// roster_group 코드 → 화면 라벨. 서버 ENUM 선언 순서 = 게임 화면 노출 순서다
export const ROSTER_GROUP_LABEL = {
  STARTING_BATTER: "선발타자",
  BENCH_BATTER: "후보타자",
  STARTING_PITCHER: "선발투수",
  RELIEF_PITCHER: "중간계투",
  CLOSER: "마무리",
};

// 키는 구단 한글 약칭
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

export const roundLabel = (r) => `D${r.day}-${r.round}`;

/* ── 파생 ─────────────────────────────────────────────────────────── */

/** 라운드 전체를 훑어 재료만 뽑는다. [{round, card, legend}] */
export const collectMaterials = (rounds) => {
  const out = [];
  for (const r of rounds) {
    for (const e of r.roster) {
      if (e.legend) out.push({ round: r, card: e.card, legend: e.legend });
    }
  }
  return out;
};

/**
 * 레전드별 행 모델.
 *
 * 재료는 카드 단위로 묶는다. 같은 카드가 여러 라운드에 나오는 경우가 6종 있는데
 * (송진우'06 등), 등장 위치를 세면 실제로 모아야 할 장수보다 많아진다.
 * 송지만은 등장 4건이지만 필요한 카드는 3장이다.
 *
 * meta 에 없는 이름은 버리지 않고 최소 정보로 채운다 — 마스터 조인이 늦거나
 * 실패해도 표는 떠 있어야 한다.
 */
export const buildLegendRows = (materials, meta) => {
  const byLegend = new Map();
  for (const m of materials) {
    if (!byLegend.has(m.legend)) byLegend.set(m.legend, new Map());
    const byCard = byLegend.get(m.legend);
    if (!byCard.has(m.card)) byCard.set(m.card, []);
    byCard.get(m.card).push(m.round);
  }

  return [...byLegend].map(([name, byCard]) => {
    // rounds 가 2개 이상이면 어느 쪽에서 먹어도 되는 카드다
    const mats = [...byCard].map(([card, rounds]) => ({
      card,
      rounds: [...rounds].sort((a, b) => a.day - b.day || a.round - b.round),
    }));
    mats.sort((a, b) => a.rounds[0].day - b.rounds[0].day || a.rounds[0].round - b.rounds[0].round);

    const days = [...new Set(mats.flatMap((m) => m.rounds.map((r) => r.day)))].sort((a, b) => a - b);
    return { name, mats, days, ...(meta[name] ?? { type: "", grade: "", team: "", pos: [] }) };
  });
};

/* ── 검색 ─────────────────────────────────────────────────────────── */

/**
 * 검색은 언제나 레전드 기준이다 — 이름 또는 레전드 소속 구단.
 * 재료 카드명("이만수'82")이나 라운드 팀명("85 삼성")에는 매칭하지 않는다.
 * 카드명을 직접 치는 사용자는 없고, 팀명 검색은 덱빌딩 화면의 몫이다.
 */
export const makeLegendHit = (query, meta) => {
  const q = query.trim().toLowerCase();
  if (!q) return () => true;
  return (name) => {
    if (String(name).toLowerCase().includes(q)) return true;
    return String(meta[name]?.team ?? "").toLowerCase().includes(q);
  };
};

/** 좁은 화면에서 잘리지 않게 앞 3명만 쓰고 나머지는 "외 N" 으로 접는다 */
export const LEGEND_PREVIEW_MAX = 3;

export const legendSummary = (names) => {
  if (names.length <= LEGEND_PREVIEW_MAX) return names.join(", ");
  const head = names.slice(0, LEGEND_PREVIEW_MAX).join(", ");
  return `${head} 외 ${names.length - LEGEND_PREVIEW_MAX}`;
};

/** 검색 중에는 라운드의 재료 수·대상 레전드도 매칭된 것만 센다 */
export const matchedMaterials = (round, legendHit) =>
  round.roster.filter((e) => e.legend && legendHit(e.legend));

/* ── 필터 ─────────────────────────────────────────────────────────── */

export const weekOptions = () => [ALL, "1주차", "2주차"];

export const dayOptions = (week) => {
  const [from, to] = week === "1주차" ? [1, 7] : week === "2주차" ? [8, 14] : [1, 14];
  const out = [ALL];
  for (let d = from; d <= to; d += 1) out.push(`D${d}`);
  return out;
};

export const dayOk = (day, { week, day: dayFilter }) => {
  if (dayFilter !== ALL) return day === Number(dayFilter.slice(1));
  if (week === "1주차") return day <= 7;
  if (week === "2주차") return day > 7;
  return true;
};

/** 구단 칩은 소속 인원을 함께 보여준다 */
export const teamOptions = (legends) => {
  const count = new Map();
  legends.forEach((l) => count.set(l.team, (count.get(l.team) ?? 0) + 1));
  return [
    [ALL, legends.length],
    ...[...count.entries()].sort((a, b) => b[1] - a[1]),
  ];
};

/** 타입에 따라 포지션 목록이 교체된다. 데이터에 있는 것만 노출 */
export const posOptions = (legends, type) => {
  const pool = legends.filter((l) => type === ALL || l.type === type);
  const base = type === "투수" ? PIT_POS : type === "타자" ? BAT_POS : POS_ORDER;
  const owned = base.filter((p) => pool.some((l) => l.pos?.includes(p)));
  return [ALL, ...owned];
};

/* ── 정렬 ─────────────────────────────────────────────────────────── */

export const SORT_DEFAULT = { [VIEW.LEGEND]: "cnt", [VIEW.ROUND]: "day" };

export const SORTABLE = new Set(["day", "dow", "cnt", "name", "days"]);

export const SORT_LABEL = {
  day: "일차",
  dow: "요일",
  cnt: "재료 수",
  name: "이름",
  days: "첫 등장",
};

/** day·days 는 순서 개념이라 빠른/늦은순, 나머지는 많은/적은순으로 읽힌다 */
export const sortDirectionLabel = (sort, dir) => {
  const ordered = sort === "day" || sort === "days";
  if (ordered) return dir < 0 ? "빠른순" : "늦은순";
  return dir < 0 ? "많은순" : "적은순";
};

const compare = (av, bv) =>
  typeof av === "string" ? String(bv).localeCompare(String(av), "ko") : bv - av;

export const sortRows = (rows, keyOf, { dir, ascendingKey = false, tieOf }) =>
  [...rows].sort((a, b) => {
    let c = compare(keyOf(a), keyOf(b));
    if (ascendingKey) c = -c;
    c *= dir < 0 ? 1 : -1;
    return c || (tieOf ? tieOf(b) - tieOf(a) : 0);
  });

/* ── 딥링크 ───────────────────────────────────────────────────────── */

/**
 * 평점표에서 ?legend=김동주B 로 넘어온다.
 * 히스토리 데이터는 레전드 마스터 표기로 맞춰 두었으므로 대개 그대로 맞지만,
 * 옛 링크나 접미 없는 표기가 들어와도 찾도록 한 단계 완화해서 매칭한다.
 * 못 찾으면 null — 조용히 무시하고 기본 화면을 띄운다.
 */
const stripSuffix = (name) => String(name ?? "").trim().replace(/[SBC]$/, "");

export const resolveLegend = (raw, legends) => {
  if (!raw) return null;
  const q = String(raw).trim();
  if (!q) return null;
  const exact = legends.find((l) => l.name === q);
  if (exact) return exact.name;
  const loose = legends.find((l) => stripSuffix(l.name) === stripSuffix(q));
  return loose ? loose.name : null;
};

/* ── 서버 응답 → 화면 모델 ────────────────────────────────────────── */

/**
 * GET /api/history-rounds 응답 1건 → 화면 모델.
 *
 * 카드 표시 문자열("이만수'82")은 여기서 조립한다. 서버는 이름과 연도를 쪼개
 * 내려주는데, 그래야 재료 마스터와 맞물리기 때문이다.
 *
 * legend 는 그 카드가 어느 레전드의 재료인지다. 게임이 L 마크를 빠뜨린 자리가
 * 있어(D7-1 송진우'06 등) 마크가 아니라 재료 마스터를 기준으로 판정된 값이다.
 */
export const toHistoryRoundModel = (item) => ({
  day: item.dayNo,
  week: item.weekNo,
  dow: item.dayOfWeek,
  round: item.roundNo,
  label: item.roundLabel,
  roster: (item.roster ?? []).map((e) => ({
    group: e.rosterGroup,
    order: e.orderNo,
    card: `${e.playerName}'${String(e.seasonYear).slice(-2)}`,
    position: e.positionCode ?? null,
    legend: e.legendName ?? null,
  })),
});
