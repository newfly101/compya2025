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
}
