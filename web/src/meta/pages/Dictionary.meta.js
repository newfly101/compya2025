import { META_STATUS } from "@/meta/types";

export const DICTIONARY_HOME_META = {
  id: "dictionary_home",
  route: "/dictionary",

  title: "조합 추천 백과사전",
  version: "1.0.0",
  lastUpdated: "2026-02-04",

  status: META_STATUS.STABLE,

  notify: true,
  summary: "백과사전 진입 카드(투수/타자/코치/구단) 구성",

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
