/* =================================================
 * KBO Match 도메인 정적 설정값
 * - 팀 메타, 경기 상태 UI, 그리드 설정
 * ================================================= */

export const KBO_TEAMS = {
  LG: { code: "LG",  name: "LG 트윈스",    color: "#C8102E", abbr: "LG"  },
  KT: { code: "KT",  name: "KT 위즈",      color: "#D00000", abbr: "KT"  },
  SSG: { code: "SSG", name: "SSG 랜더스",   color: "#CE0E2D", abbr: "SSG" },
  NC:  { code: "NC",  name: "NC 다이노스",  color: "#1D5FAD", abbr: "NC"  },
  KIA: { code: "KIA", name: "KIA 타이거즈", color: "#EA0029", abbr: "KIA" },
  LT:  { code: "LT",  name: "롯데 자이언츠",color: "#D00000", abbr: "LT"  },
  HH:  { code: "HH",  name: "한화 이글스",  color: "#FF6600", abbr: "HH"  },
  OB:  { code: "OB",  name: "두산 베어스",  color: "#131230", abbr: "OB"  },
  KW:  { code: "KW",  name: "키움 히어로즈",color: "#820024", abbr: "KW"  },
  SS:  { code: "SS",  name: "삼성 라이온즈",color: "#074CA1", abbr: "SS"  },
};

export const MATCH_STATUS = {
  BEFORE: {
    key: "BEFORE",
    label: "경기 전",
    badgeClass: "before",
  },
  LIVE: {
    key: "LIVE",
    label: "진행중",
    badgeClass: "live",
  },
  FINAL: {
    key: "FINAL",
    label: "종료",
    badgeClass: "final",
  },
};

export const RECENT_RESULT = {
  W: { label: "승", resultClass: "win"  },
  L: { label: "패", resultClass: "loss" },
  D: { label: "무", resultClass: "draw" },
};

export const TODAY_MATCH_GRID = {
  columns: 3,
  maxVisible: 6,
};
