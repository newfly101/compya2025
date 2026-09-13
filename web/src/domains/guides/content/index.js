// domains/guides/content/index.js
// 가이드 콘텐츠 레지스트리 — /guides 목록, /guides/:slug 상세, 각 도메인 화면의
// GuideModal 이 전부 이 한 곳을 공용 소스로 삼는다(원본 하나, 감싸는 쪽만 다름).
//
// 완성된 편만 여기 등록한다. 본문 없는 편은 절대 넣지 않는다 — 목록·라우트·사이트맵·
// 프리렌더 어디에도 노출하지 않기 위해서다(placeholder 본문 금지 원칙).
// 12편 전편 작성 완료 (2026-09-13) — 기획서 docs/domain/guides/prd/guides-content-plan.md 참조.

import { legendMaterialPriority } from "@/domains/guides/content/legendMaterialPriority.js";
import { legendStatsGuide } from "@/domains/guides/content/legendStatsGuide.js";
import { mileageSniping } from "@/domains/guides/content/mileageSniping.js";
import { historyLegendGuide } from "@/domains/guides/content/historyLegendGuide.js";
import { playerSkillsGuide } from "@/domains/guides/content/playerSkillsGuide.js";
import { playerEncyclopedia } from "@/domains/guides/content/playerEncyclopedia.js";
import { start } from "@/domains/guides/content/start.js";
import { probabilityGuide } from "@/domains/guides/content/probabilityGuide.js";
import { couponGuide } from "@/domains/guides/content/couponGuide.js";
import { eventGuide } from "@/domains/guides/content/eventGuide.js";
import { noticeGuide } from "@/domains/guides/content/noticeGuide.js";
import { homeGuide } from "@/domains/guides/content/homeGuide.js";

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
];

export const GUIDES_BY_SLUG = Object.fromEntries(GUIDES.map((g) => [g.slug, g]));

export const getGuideBySlug = (slug) => GUIDES_BY_SLUG[slug];

// 기획서 12편 전편 작성 완료 — 예약 slug 없음.
export const RESERVED_SLUGS = [];
