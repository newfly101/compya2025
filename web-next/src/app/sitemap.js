import { SITE_URL } from "@/config/env.js";
import { fetchNotices } from "@/domains/notices/api.js";
import { fetchEvents } from "@/domains/events/api.js";
import { GUIDES } from "@/domains/guides/content/index.js";
import { noticeDetailPath, eventDetailPath } from "@/config/routePath.js";

export const revalidate = 3600;

// 원본 web/public/sitemap.xml 의 값 그대로. noindex 경로(로그인·마이페이지·시뮬레이터 등)는 넣지 않는다.
// /legend-stats /history-mode/legend /mileage /players /skills /probability 는 아직 web-next 에 없다(곧 이전) — 원본 sitemap 에 있어 미리 포함.
const STATIC = [
  ["/", "daily", 1.0],
  ["/coupons", "daily", 0.8],
  ["/events", "daily", 0.8],
  ["/notices", "daily", 0.8],
  ["/probability", "weekly", 0.7],
  ["/players", "weekly", 0.7],
  ["/legend-stats", "weekly", 0.8],
  ["/skills", "monthly", 0.8],
  ["/history-mode/legend", "weekly", 0.8],
  ["/mileage", "weekly", 0.7],
  ["/guides", "monthly", 0.6],
  ...GUIDES.filter((g) => !g.hidden).map((g) => [`/guides/${g.slug}`, "monthly", 0.6]),
  ["/privacy", "yearly", 0.3],
  ["/terms", "yearly", 0.3],
  ["/contact", "yearly", 0.3],
  ["/about", "yearly", 0.3],
];

const day = (v) => (v ? new Date(v) : undefined);

// API 실패 시 동적 항목만 빠지고 정적 항목은 유지한다.
export default async function sitemap() {
  const entries = STATIC.map(([p, changeFrequency, priority]) => ({ url: `${SITE_URL}${p === "/" ? "/" : p}`, changeFrequency, priority }));
  const [notices, events] = await Promise.allSettled([fetchNotices(), fetchEvents()]);
  if (notices.status === "fulfilled") {
    for (const n of notices.value.siteNotices) {
      entries.push({ url: `${SITE_URL}${noticeDetailPath(n)}`, lastModified: day(n.publishedAt || n.createdAt), changeFrequency: "monthly", priority: 0.5 });
    }
  }
  if (events.status === "fulfilled") {
    for (const e of events.value) entries.push({ url: `${SITE_URL}${eventDetailPath(e.id)}`, changeFrequency: "monthly", priority: 0.5 });
  }
  return entries;
}
