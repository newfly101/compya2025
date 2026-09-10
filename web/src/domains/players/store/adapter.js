// 서버 응답(player-cards API) → 화면(PlayerEncyclopediaScreen, 1단계 config/playersLoader.js)
// 이 기대하는 카드 형태로 변환한다. 화면은 4단계에서 이 어댑터를 거친 데이터를 받는다.
import { TEAMS_RAW } from "@/domains/mileage/config/mileage.js";

// 구단 코드 → 표시명. mileage 도메인의 원본 매핑을 재사용한다(중복 정의 금지).
// 단, KT 는 mileage 표에서만 "KT"(대문자)로 쓰고, 선수 백과사전은 design_handoff
// README 의 고정 표시 순서를 "kt"(소문자)로 못 박아 뒀다 — 이 도메인에서만 덮어쓴다.
const TEAM_NAME_BY_CODE = Object.fromEntries(TEAMS_RAW.map((t) => [t.code, t.name]));
TEAM_NAME_BY_CODE.KT = "kt";

// 서버 H(타자)/P(투수) → 화면 B/P. 코치(C)는 서버가 주지 않는다.
// 서버가 주는 H/P 를 그대로 쓴다 — 화면 탭 키도 H/P 다.

// 카드 종류 — DB 엔 일반/시그니처 2종만 실존(playersLoader.js ACTIVE_KINDS 참고).
const KIND_NORMAL = "일반";
const KIND_SIGNATURE = "시그니처";

/**
 * 서버 카드 1건 → 화면이 기대하는 카드 1건.
 * - id: 서버가 안 줘서(응답 용량 절감 목적으로 뺐다) FE 가 만든다. DB UNIQUE 키인
 *   (tm, y, pos, n) 조합을 그대로 쓴다 — 배열 인덱스는 필터로 순서가 바뀌어 금지.
 * - y: 화면이 select value 비교·연도.slice(2) 를 문자열 전제로 쓰므로 문자열로 바꾼다.
 * - kinds: 화면은 카드 종류를 배열로 필터링한다(FilterSheet). sg 는 0/1 뿐이라
 *   일반/시그니처 1개짜리 배열로 바꾸면 된다.
 */
export function toScreenPlayer(serverCard) {
  const { n, tm, y, t, pos, sg, L, LN } = serverCard;

  return {
    id: `${tm}-${y}-${pos}-${n}`,
    n,
    tm: TEAM_NAME_BY_CODE[tm] ?? tm, // 매핑 안 되는 코드는 방어적으로 원본 유지
    y: String(y),
    t: t,
    pos,
    kinds: [sg ? KIND_SIGNATURE : KIND_NORMAL],
    L: L ?? 0,
    LN: LN ?? null,
  };
}
