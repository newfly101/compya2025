// 서버 응답(player-cards/{teamCode}/stats API) → 리스트형 표가 기대하는 행으로 변환.
// id 는 카드 목록 어댑터(store/adapter.js toScreenPlayer)와 반드시 같은 값이어야 조인이 된다.
// 그 어댑터의 id 는 팀 "코드"(예: LOT)를 그대로 쓴다(표시명으로 바꾸기 전 원본 필드) —
// 여기서도 표시명이 아니라 teamCode(파라미터로 받은 원본 코드)를 그대로 써야 한다.

// 구종 10종 고정 순서 — sql/V3/data/data_player_card_stat_INSERT.sql 실측 코드값,
// design_handoff README 표기 순서와 1:1.
export const PITCH_CODES = [
  "FOUR_SEAM",
  "TWO_SEAM",
  "CHANGEUP",
  "CIRCLE_CHANGEUP",
  "SLIDER",
  "CURVE",
  "FORKBALL",
  "CUTTER",
  "SINKER",
  "SPLITTER",
];
export const PITCH_LABELS = [
  "포심", "투심", "체인지업", "서클 체인지업", "슬라이더", "커브", "포크", "커터", "싱커", "스플리터",
];
export const PITCH_SHORT = ["포심", "투심", "체인", "서클", "슬라", "커브", "포크", "커터", "싱커", "스플"];

/**
 * 서버 스탯 1건 → 화면 리스트 행.
 * pt(보유 구종만) → 고정 10칸 배열로 펼친다. 안 던지는 구종은 "-".
 */
export function toScreenStatRow(serverRow, teamCode) {
  const { n, y, pos, t, st, pt } = serverRow;
  const gradeByCode = new Map((pt ?? []).map((p) => [p.c, p.g]));
  const pv = PITCH_CODES.map((code) => gradeByCode.get(code) ?? "-");

  return {
    id: `${teamCode}-${y}-${pos}-${n}`,
    t,
    st: st ?? [],
    pv,
  };
}
