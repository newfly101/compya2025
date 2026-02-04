import { HITTER_RECOMMEND } from "@/data/skill/HITTER_RECOMMEND.js";
import { HITTER_SKILL_EXCLUSIVE } from "@/domains/dictionary/feature/config/skillExclusive.js";
import { PITCHER_RECOMMEND } from "@/data/skill/PITCHER_RECOMMEND.js";

export const DICTIONARY_PLAYER_CONFIG = {
  hitter: {
    type: "player",
    requestType: "HITTER",
    recommendData: HITTER_RECOMMEND,
    skillExclusive: HITTER_SKILL_EXCLUSIVE,
  },
  pitcher: {
    type: "player",
    requestType: "PITCHER",
    recommendData: PITCHER_RECOMMEND,
    skillExclusive: null,
  },
};

export const PLAYER_SKILL_GRADE_CONFIG = ["전체", "LEGEND", "PLATINUM", "HERO", "NORMAL"];
export const PLAYER_POSITION_CONFIG = {
  hitter: {
    label: "타석",
    options: ["전체", "1번 타자", "4번 타자"],
  },
  pitcher: {
    label: "포지션",
    options: ["전체", "선발", "필승조", "추격조", "롱릴리프", "마무리"],
  },
};
