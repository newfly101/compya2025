// domains/guides/content/index.js
// 가이드 콘텐츠 레지스트리 — /guides 목록, /guides/:slug 상세, 각 도메인 화면의
// 가이드 아코디언이 전부 이 한 곳을 공용 소스로 삼는다(원본 하나, 감싸는 쪽만 다름).
//
// 완성된 편만 여기 등록한다. 본문 없는 편은 절대 넣지 않는다 — 목록·라우트·사이트맵·
// 프리렌더 어디에도 노출하지 않기 위해서다(placeholder 본문 금지 원칙).
// 12편 전편 작성 완료 (2026-09-13) — 기획서 docs/features/guides/spec.md 참조.

import { legendMaterialPriority } from "@/features/guides/content/legendMaterialPriority.js";
import { legendStatsGuide } from "@/features/guides/content/legendStatsGuide.js";
import { mileageSniping } from "@/features/guides/content/mileageSniping.js";
import { historyLegendGuide } from "@/features/guides/content/historyLegendGuide.js";
import { playerSkillsGuide } from "@/features/guides/content/playerSkillsGuide.js";
import { playerEncyclopedia } from "@/features/guides/content/playerEncyclopedia.js";
import { start } from "@/features/guides/content/start.js";
import { probabilityGuide } from "@/features/guides/content/probabilityGuide.js";
import { couponGuide } from "@/features/guides/content/couponGuide.js";
import { eventGuide } from "@/features/guides/content/eventGuide.js";
import { noticeGuide } from "@/features/guides/content/noticeGuide.js";
import { homeGuide } from "@/features/guides/content/homeGuide.js";
import { gamificationGuide } from "@/features/guides/content/gamification.js";

// 노출 순서 — 기획서 우선순위(11번이 1순위) 그대로. 시드가 있는 2~7번 계열이 뒤를 잇고,
// 신규 작성 계열(1·8·9·10·12번)이 마지막을 잇는다.
export const GUIDES = [
  legendMaterialPriority,
  legendStatsGuide,
  mileageSniping,
  historyLegendGuide,
  playerSkillsGuide,
  playerEncyclopedia,
  probabilityGuide,
  couponGuide,
  eventGuide,
  noticeGuide,
  homeGuide,
  start,
  // hidden: 목록(/guides)에는 안 나오고 slug 링크로만 들어온다(등급 모달의 "전체 안내 보기"). 프리렌더·사이트맵은 수동 목록이라 자동 제외.
  gamificationGuide,
];

export const GUIDES_BY_SLUG = Object.fromEntries(GUIDES.map((g) => [g.slug, g]));

export const getGuideBySlug = (slug) => GUIDES_BY_SLUG[slug];

// 기획서 12편 전편 작성 완료 — 예약 slug 없음.
export const RESERVED_SLUGS = [];
