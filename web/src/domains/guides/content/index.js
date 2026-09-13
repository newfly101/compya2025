// domains/guides/content/index.js
// 가이드 콘텐츠 레지스트리 — /guides 목록, /guides/:slug 상세, 각 도메인 화면의
// GuideModal 이 전부 이 한 곳을 공용 소스로 삼는다(원본 하나, 감싸는 쪽만 다름).
//
// 완성된 편만 여기 등록한다. 본문 없는 편은 절대 넣지 않는다 — 목록·라우트·사이트맵·
// 프리렌더 어디에도 노출하지 않기 위해서다(placeholder 본문 금지 원칙).
// 나머지 예정 편(기획서 docs/domain/guides/prd/guides-content-plan.md 참조)은
// RESERVED_SLUGS 에 slug 만 적어 향후 작업자가 목차를 참조할 수 있게 해둔다.

import { legendMaterialPriority } from "@/domains/guides/content/legendMaterialPriority.js";
import { legendStatsGuide } from "@/domains/guides/content/legendStatsGuide.js";
import { mileageSniping } from "@/domains/guides/content/mileageSniping.js";
import { historyLegendGuide } from "@/domains/guides/content/historyLegendGuide.js";
import { playerSkillsGuide } from "@/domains/guides/content/playerSkillsGuide.js";
import { playerEncyclopedia } from "@/domains/guides/content/playerEncyclopedia.js";

// 노출 순서 — 기획서 우선순위(11번이 1순위) 그대로. 시드가 있는 2~7번 계열이 뒤를 잇는다.
export const GUIDES = [
  legendMaterialPriority,
  legendStatsGuide,
  mileageSniping,
  historyLegendGuide,
  playerSkillsGuide,
  playerEncyclopedia,
];

export const GUIDES_BY_SLUG = Object.fromEntries(GUIDES.map((g) => [g.slug, g]));

export const getGuideBySlug = (slug) => GUIDES_BY_SLUG[slug];

// 기획서 12편 중 아직 본문을 쓰지 않은 예정 편 — slug만 예약(라우트/사이트맵 미노출).
// 본문 작성이 끝나면 위 GUIDES 배열에 옮기고 여기서 제거한다.
export const RESERVED_SLUGS = [
  "start", // 처음 오셨다면 — 컴프야펀 5분 사용법
  "probability-guide", // 확률형 아이템 공시, 어디를 봐야 하나
  "coupon-guide", // 쿠폰 코드 등록부터 유효기간 체크까지
  "event-guide", // 이벤트 참여 전 확인할 것들
  "notice-guide", // 공지사항, 놓치지 않고 챙겨보는 법
  "home-guide", // 홈 화면 200% 활용법
];
