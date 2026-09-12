// domains/mileage/config/mileageTargetList.js
// 「저격 선수 리스트」 탭 전용 순수 함수/상수. config/mileage.js(불가침, node 사전계산용)와는
// 별도 파일로 둔다 — 이 파일은 그 계약(DOM 미참조 등)에 얽매이지 않지만, 굳이 섞지 않는다.
//
// 대상: docs/domain/mileage/prd/target-list-design-spec.md §4/§6

import { TEAMS_RAW } from "@/domains/mileage/config/mileage.js";

export const POS_ORDER = ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH", "SP", "RP", "CP"];

// 포지션 칩 2행 배치(핸드오프 §1-2) — 1행 타자, 2행 투수
export const POS_ROWS = [
  ["C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"],
  ["SP", "RP", "CP"],
];

// 구단 코드 → 한글 표시명. players/store/adapter.js 와 동일 패턴(TEAMS_RAW 파생)이나
// import 재사용은 순환 의존이 되므로 로컬로 재구성한다(§0, §6 결론 그대로).
export const TEAM_NAME_BY_CODE = Object.fromEntries(TEAMS_RAW.map((t) => [t.code, t.name]));

// 구단 도트 색 — legendStats/historyLegend 의 TEAM_COLOR(10개 현대 구단)를 동일 값으로
// 재정의(도메인마다 값 중복 정의하는 이 코드베이스 관행)하고, 핸드오프 데이터 범위
// (1982~)의 구 구단만 핸드오프 색으로 보충한다.
// kt/KT 는 legendStats 와 동일하게 회색(#9aa0aa) — 핸드오프 원안(검정 #000)은 다크
// 배경에서 거의 안 보여 접근성 문제라 채택하지 않는다(design-spec §2.1 결정).
export const TEAM_DOT_COLOR = {
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
  // 구 구단 보충(핸드오프 §1-4 값 그대로)
  OB: "#1a2f6b",
  MBC: "#c30452",
  빙그레: "#ff6600",
  해태: "#e5363c",
  현대: "#1f8a4c",
  쌍방울: "#c8102e",
  태평양: "#2b6cb0",
  청보: "#6b6580",
  삼미: "#6b6580",
  SK: "#ff4c1a",
};

const DEFAULT_DOT_COLOR = "#6b6580";
export const teamDotColor = (team) => TEAM_DOT_COLOR[team] ?? DEFAULT_DOT_COLOR;

/**
 * API 응답(cardId/teamCode/seasonYear/positionCode/playerName/legendName) → 화면 모델.
 * subPositionCode: 겸업 부포지션(없으면 null) — BE 쿼리가 주/부 어느 칸이든 유일하면
 * 저격 대상으로 잡으므로(부포지션 반영), 표기·필터 모두 이 값을 함께 봐야 한다.
 *
 * mainUnique/subUnique: 「어느 칸이 유일해서 뽑혔는지」 BE 플래그(운영 실측 — 주만 104 ·
 * 부만 7 · 둘 다 0건). 아직 안 내려주는 서버(구버전)도 있어 boolean 이 아니면 null 로 —
 * 이 null 을 "모른다"로 구분해야 MileageScreen 이 구버전에서도 안전하게 폴백한다.
 */
export function toTargetListModel(raw) {
  return {
    id: raw.cardId,
    name: raw.playerName,
    team: TEAM_NAME_BY_CODE[raw.teamCode] ?? raw.teamCode,
    year: raw.seasonYear,
    pos: raw.positionCode,
    subPos: raw.subPositionCode ?? null,
    mainUnique: typeof raw.mainUnique === "boolean" ? raw.mainUnique : null,
    subUnique: typeof raw.subUnique === "boolean" ? raw.subUnique : null,
    // INNER JOIN 이라 실데이터는 항상 non-null 이지만(§0), 방어적으로 null 처리는 남겨둔다.
    legend: raw.legendName ?? null,
  };
}

/** 필터: 포지션 칩은 검색 모드와 무관하게 항상 적용(핸드오프 "필터·검색·정렬" §1) */
export function filterRows(data, { pos, query, mode }) {
  let rows = pos ? data.filter((d) => d.pos === pos || d.subPos === pos) : data;
  const q = query.trim().toLowerCase();
  if (q) {
    rows = rows.filter((d) =>
      (mode === "pos" ? `${d.name}${d.team}${d.year}` : (d.legend ?? "")).toLowerCase().includes(q),
    );
  }
  return rows;
}

const byKo = (a, b) => a.localeCompare(b, "ko");

// 정렬 비교자 5종 — 전부 2차 tie-break 존재(핸드오프 §"필터·검색·정렬" §3 그대로)
export const SORT_COMPARATORS = {
  pos: (a, b) =>
    POS_ORDER.indexOf(a.pos) - POS_ORDER.indexOf(b.pos) || byKo(a.name, b.name) || a.year - b.year,
  name: (a, b) => byKo(a.name, b.name) || a.year - b.year,
  legend: (a, b) => byKo(a.legend ?? "", b.legend ?? "") || byKo(a.name, b.name),
  team: (a, b) => byKo(a.team, b.team) || a.year - b.year,
  year: (a, b) => a.year - b.year || byKo(a.name, b.name),
};

export function sortRows(rows, sortKey, dir) {
  const cmp = SORT_COMPARATORS[sortKey] ?? SORT_COMPARATORS.pos;
  return [...rows].sort((a, b) => cmp(a, b) * dir);
}

export const SORT_LABEL = {
  pos: "포지션순",
  name: "이름순",
  legend: "레전드순",
  team: "구단순",
  year: "연도순",
};
