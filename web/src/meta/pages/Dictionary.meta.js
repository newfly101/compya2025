import { META_STATUS } from "@/meta/types";

export const DICTIONARY_HOME_META = {

  // default information
  title: "스킬 백과사전",
  feature: "dictionary",
  baseRoute: "/dictionary",
  status: META_STATUS.STABLE,

  notify: true,
  summary: "백과사전 진입 카드(투수/타자/코치/구단) 구성",

  // feature index information
  contexts: {
    home: {
      route: "/dictionary",
      title: "백과사전 홈",
      version: "1.0.0",
      lastUpdated: "2026-02-04",
      summary: "백과사전 진입 카드 구성",
    },

    pitcher: {
      route: "/dictionary/pitcher",
      title: "투수 스킬 백과사전",
      version: "1.0.1",
      lastUpdated: "2026-02-10",
      summary: "간편/상세 보기 토글 UI 추가",
    },

    hitter: {
      route: "/dictionary/hitter",
      title: "타자 스킬 백과사전",
      version: "1.0.0",
      lastUpdated: "2026-02-05",
      summary: "타자 스킬 설명/조합 백과사전 공개",
    },
  },

  // changeLog assets
  changelog: [
    {
      version: "1.0.5",
      date: "2026-02-10",
      type: "release",
      description: "타자 스킬 조합 백과사전 최초 공개",
    },
    {
      version: "0.1.4",
      date: "2026-01-02",
      type: "release",
      description: "투수 스킬 조합 백과사전 최초 공개",
    },
  ],
};
