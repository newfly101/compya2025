// data/players/index.js
// players.json (13,978건) 을 모듈 로드 시 1회 인덱싱해서 재사용한다.
// 이 파일 외 다른 곳에서 players.json 을 직접 import 하지 않는다.

import playersData from "./players.json";

// ── 한글 구단명 ↔ URL slug 매핑 ────────────────────────────────
export const TEAM_SLUG = {
  롯데: "lotte",
  삼성: "samsung",
  LG: "lg",
  한화: "hanwha",
  두산: "doosan",
  KIA: "kia",
  SK: "sk",
  키움: "kiwoom",
  해태: "haitai",
  NC: "nc",
  OB: "ob",
  kt: "kt",
  현대: "hyundai",
  쌍방울: "ssangbangwool",
  태평양: "taepyeongyang",
  빙그레: "binggrae",
  SSG: "ssg",
  MBC: "mbc",
  청보: "chungbo",
  삼미: "sammi",
  국가대표: "national",
};

export const SLUG_TO_TEAM = Object.fromEntries(
  Object.entries(TEAM_SLUG).map(([team, slug]) => [slug, team])
);

// 코치 판정 — 원본 확률표 코치팩 시트 대조 검증 완료 (2,282명, 원본 2,276명 대비 99.8% 일치, 과잉 포착 0)
// grades 기준으로만 판정한다 (cardTypes 아님 — 대표팀 코치진은 cardTypes:["국가대표"] 라 cardTypes 로는 못 거른다).
// 선수 겸 코치 5명(백인천'82 등)은 grades 5종이라 이 규칙에서 선수로 분류된다 — 의도된 동작.
export function isCoach(p) {
  const g = p?.grades ?? [];
  return g.length === 3 && g.includes("스페셜") && g.includes("히어로") && g.includes("플래티넘");
}

const normalizeYearKey = (year) =>
  year === null || year === undefined || year === "legend" ? "legend" : year;

// 최고 등급 표기 — 수치 없이 텍스트 라벨만. 등급 서열 정렬용이 아니라 "1개 대표 라벨" 산출용.
// 판정 우선순위: 레전드(grades 고유) > 에픽(grades 고유) > 시그니처(cardTypes — "연대 시그니처"는 제외) > grades 최상위(사실상 플래티넘)
const GRADE_ORDER = ["노멀", "레어", "스페셜", "히어로", "플래티넘"];

export function getTopGrade(p) {
  const grades = p?.grades ?? [];
  const cardTypes = p?.cardTypes ?? [];

  if (grades.includes("레전드")) return "레전드";
  if (grades.includes("에픽")) return "에픽";
  if (cardTypes.includes("시그니처")) return "시그니처";

  let top = null;
  for (const g of grades) {
    const idx = GRADE_ORDER.indexOf(g);
    if (idx === -1) continue;
    if (top === null || idx > GRADE_ORDER.indexOf(top)) top = g;
  }
  return top ?? "플래티넘";
}

const { players = [] } = playersData ?? {};

// "구단 전체" 가상 slug — 21개 구단과 같은 방식으로 yearIndex/cellIndex/roster*Index 에 함께 쌓는다.
// 별도 순회 없이 기존 단일 for-loop 안에서만 처리 (아래 indexCell 참고).
export const ALL_TEAM_SLUG = "all";

// team -> { count, years:number[], hasLegend }
const teamIndex = new Map();
// slug -> Map(yearKey -> { total, playerCount, coachCount })   yearKey: number | "legend"
const yearIndex = new Map();
// `${slug}::${yearKey}` -> player[]  (선수+코치 통합, 기존 getPlayers 용)
const cellIndex = new Map();
// `${slug}::${yearKey}` -> player[]  (코치 제외 — 선수만)
const rosterPlayerIndex = new Map();
// `${slug}::${yearKey}` -> player[]  (코치만)
const rosterCoachIndex = new Map();

// slug(구단 slug 또는 ALL_TEAM_SLUG) + yearKey 셀 하나에 레코드 1건을 반영.
// "구단 전체" 도 이 함수를 같은 루프 안에서 한 번 더 호출해 채운다 — players 배열 재순회 없음.
function indexCell(slugKey, yearKey, p, coach) {
  if (!yearIndex.has(slugKey)) yearIndex.set(slugKey, new Map());
  const yMap = yearIndex.get(slugKey);
  const yEntry = yMap.get(yearKey) ?? { total: 0, playerCount: 0, coachCount: 0 };
  yEntry.total += 1;
  if (coach) yEntry.coachCount += 1;
  else yEntry.playerCount += 1;
  yMap.set(yearKey, yEntry);

  const cellKey = `${slugKey}::${yearKey}`;

  if (!cellIndex.has(cellKey)) cellIndex.set(cellKey, []);
  cellIndex.get(cellKey).push(p);

  const rosterIndex = coach ? rosterCoachIndex : rosterPlayerIndex;
  if (!rosterIndex.has(cellKey)) rosterIndex.set(cellKey, []);
  rosterIndex.get(cellKey).push(p);
}

for (const p of players) {
  const slug = TEAM_SLUG[p?.team];
  if (!slug) continue; // 매핑 없는 구단명 방어

  if (!teamIndex.has(p.team)) {
    teamIndex.set(p.team, { count: 0, years: [], hasLegend: false });
  }
  const teamEntry = teamIndex.get(p.team);
  teamEntry.count += 1;

  const yearKey = p.year ?? "legend";
  if (yearKey === "legend") {
    teamEntry.hasLegend = true;
  } else {
    teamEntry.years.push(yearKey);
  }

  const coach = isCoach(p);

  indexCell(slug, yearKey, p, coach);
  indexCell(ALL_TEAM_SLUG, yearKey, p, coach);
}

// 셀 내부 이름 가나다순 정렬 (모듈 로드 시 1회)
const sortByName = (a, b) => a.name.localeCompare(b.name, "ko");
for (const list of cellIndex.values()) list.sort(sortByName);
for (const list of rosterPlayerIndex.values()) list.sort(sortByName);
for (const list of rosterCoachIndex.values()) list.sort(sortByName);

/**
 * 구단 목록 — 선수수 내림차순
 * @returns {{team:string, slug:string, count:number, yearFrom:number|null, yearTo:number|null, hasLegend:boolean}[]}
 */
export function getTeams() {
  return Array.from(teamIndex.entries())
    .map(([team, entry]) => ({
      team,
      slug: TEAM_SLUG[team],
      count: entry.count,
      yearFrom: entry.years.length ? Math.min(...entry.years) : null,
      yearTo: entry.years.length ? Math.max(...entry.years) : null,
      hasLegend: entry.hasLegend,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 구단 선택 모달용 타일 목록 — "구단 전체" 1개 + 구단 21개 = 22개.
 * getTeams() 재사용 (추가 순회 없음). "전체" 는 맨 앞에 고정.
 * @returns {{team:string, slug:string, count:number, isAll:boolean}[]}
 */
export function getTeamTiles() {
  const teams = getTeams();
  const totalCount = teams.reduce((sum, t) => sum + t.count, 0);
  return [
    { team: "전체", slug: ALL_TEAM_SLUG, count: totalCount, isAll: true },
    ...teams.map((t) => ({ ...t, isAll: false })),
  ];
}

/**
 * 구단(slug)의 연도 목록 — 최신 연도 우선, 레전드 그룹은 맨 앞(year: null)
 * @param {string} slug
 * @returns {{year:number|null, count:number, playerCount:number, coachCount:number}[]}
 */
export function getYears(slug) {
  const yMap = yearIndex.get(slug);
  if (!yMap) return [];

  const entries = Array.from(yMap.entries());
  const legend = entries.filter(([y]) => y === "legend");
  const normal = entries.filter(([y]) => y !== "legend").sort((a, b) => b[0] - a[0]);

  return [...legend, ...normal].map(([year, entry]) => ({
    year: year === "legend" ? null : year,
    count: entry.total,
    playerCount: entry.playerCount,
    coachCount: entry.coachCount,
  }));
}

/**
 * 구단(slug) + 연도 셀의 선수 목록 (선수+코치 통합). year 가 null/undefined/'legend' 면 레전드 그룹.
 * ⚠️ 기존 시그니처·반환 그대로 유지 — 호출부 호환.
 * @param {string} slug
 * @param {number|null|'legend'} [year]
 * @returns {object[]}
 */
export function getPlayers(slug, year) {
  const yearKey = normalizeYearKey(year);
  return cellIndex.get(`${slug}::${yearKey}`) ?? [];
}

/**
 * 구단(slug) + 연도 셀의 "선수만" 목록 (코치 제외). getPlayers 와 동일한 인덱싱 방식.
 * @param {string} slug
 * @param {number|null|'legend'} [year]
 * @returns {object[]}
 */
export function getRosterPlayers(slug, year) {
  const yearKey = normalizeYearKey(year);
  return rosterPlayerIndex.get(`${slug}::${yearKey}`) ?? [];
}

/**
 * 구단(slug) + 연도 셀의 "코치만" 목록.
 * @param {string} slug
 * @param {number|null|'legend'} [year]
 * @returns {object[]}
 */
export function getRosterCoaches(slug, year) {
  const yearKey = normalizeYearKey(year);
  return rosterCoachIndex.get(`${slug}::${yearKey}`) ?? [];
}

// ── 카드 종류(cardTypes) 별 타일 전개 ────────────────────────────
// 컴프야 카드 도감처럼 한 레코드가 카드 종류 수만큼 개별 타일로 보이게 한다.
// 실측(2026-08): 13,978건 → 26,424타일. cardTypes 없는 레코드는 "일반" 1장으로 취급.
export const CARD_TYPE_ORDER = [
  "레전드",
  "에픽",
  "MVP",
  "골든글러브",
  "올스타",
  "국가대표",
  "시그니처",
  "연대 시그니처",
  "일반",
];

/**
 * 선수/코치 목록 → 카드 종류별 타일로 전개.
 * @param {object[]} rosterList
 * @returns {{tileId:string, player:object, cardType:string}[]}
 */
export function expandToCardTiles(rosterList) {
  const tiles = [];
  for (const p of rosterList) {
    const types = p?.cardTypes?.length ? p.cardTypes : ["일반"];
    for (const cardType of types) {
      tiles.push({ tileId: `${p.id}::${cardType}`, player: p, cardType });
    }
  }
  return tiles;
}
