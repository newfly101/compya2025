import { DICTIONARY_HOME_META } from "./pages/dictionary.meta";
import { DICTIONARY_PITCHER_META } from "./pages/dictionaryPitcher.meta";
import { DICTIONARY_HITTER_META } from "./pages/dictionaryHitter.meta";

export const PAGE_META_REGISTRY = [
  DICTIONARY_HOME_META,
  DICTIONARY_PITCHER_META,
  DICTIONARY_HITTER_META,
];

// route 기준으로 찾는 헬퍼 (편의)
export const getMetaByRoute = (route) =>
  PAGE_META_REGISTRY.find((m) => m.route === route);

// id 기준 헬퍼
export const getMetaById = (id) =>
  PAGE_META_REGISTRY.find((m) => m.id === id);
