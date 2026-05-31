// WIKI_CATEGORIES.js — 카테고리 entry 9칸 정적 config
// ENC-0 WikiScreen 에서 사용
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";

export const WIKI_CATEGORIES = [
  {
    id: "pitcher_skill",
    icon: "⚾",
    label: "투수\n스킬",
    to: ROUTE_PATHS.wiki_skill("pitcher"),
    comingSoon: false,
  },
  {
    id: "hitter_skill",
    icon: "🏏",
    label: "타자\n스킬",
    to: ROUTE_PATHS.wiki_skill("hitter"),
    comingSoon: false,
  },
  {
    id: "pitcher_recommend",
    icon: "📋",
    label: "추천 조합\n(투수)",
    to: ROUTE_PATHS.wiki_recommend("pitcher"),
    comingSoon: false,
  },
  {
    id: "hitter_recommend",
    icon: "📊",
    label: "추천 조합\n(타자)",
    to: ROUTE_PATHS.wiki_recommend("hitter"),
    comingSoon: false,
  },
  {
    id: "pitcher_game_info",
    icon: "📖",
    label: "게임 정보\n(투수)",
    to: null,
    comingSoon: true,
  },
  {
    id: "hitter_game_info",
    icon: "📚",
    label: "게임 정보\n(타자)",
    to: null,
    comingSoon: true,
  },
  {
    id: "coach",
    icon: "🧑‍💼",
    label: "코치",
    to: null,
    comingSoon: true,
  },
  {
    id: "player",
    icon: "⭐",
    label: "구단 선수",
    to: null,
    comingSoon: true,
  },
  {
    id: "epic",
    icon: "💎",
    label: "에픽",
    to: null,
    comingSoon: true,
  },
];
