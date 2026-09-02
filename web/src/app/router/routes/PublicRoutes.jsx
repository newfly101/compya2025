import React, { lazy } from "react";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import AuthCallback from "@/domains/authentication/callback/AuthCallBack.jsx";
import PlayersLegacyRedirect from "@/app/router/routes/PlayersLegacyRedirect.jsx";
const HomePage = lazy(() => import("@/domains/home/components/HomeScreen.jsx"));
const CouponPage = lazy(() => import("@/domains/coupons/mobile/CouponScreen.jsx"));
const EventPage = lazy(() => import("@/domains/events/mobile/EventScreen.jsx"));
const NoticePage = lazy(() => import("@/domains/notices/mobile/NoticeScreen.jsx"));
const NoticeDetailPage = lazy(() => import("@/domains/notices/mobile/NoticeDetailScreen.jsx"));
const OddsIndexPage = lazy(() => import("@/domains/odds/mobile/OddsIndexScreen.jsx"));
const OddsSectionPage = lazy(() => import("@/domains/odds/mobile/OddsSectionScreen.jsx"));
const PlayerEncyclopediaPage = lazy(() => import("@/domains/players/mobile/PlayerEncyclopediaScreen.jsx"));
const LegendMaterialPage = lazy(() => import("@/domains/legendMaterials/mobile/LegendMaterialScreen.jsx"));
const LegendStatsPage = lazy(() => import("@/domains/legendStats/mobile/LegendStatsScreen.jsx"));
const HistoryModePage = lazy(() => import("@/domains/historyMode/mobile/HistoryModeScreen.jsx"));
const PrivacyPolicyPage = lazy(() => import("@/domains/policy/mobile/PrivacyPolicyScreen.jsx"));
const TermsPage = lazy(() => import("@/domains/policy/mobile/TermsScreen.jsx"));
const ContactPage = lazy(() => import("@/domains/policy/mobile/ContactScreen.jsx"));
const AboutPage = lazy(() => import("@/domains/policy/mobile/AboutScreen.jsx"));
// 커뮤니티 — 2026-08-31 읽기 전용 재오픈 (글쓰기/댓글/좋아요는 서버 인증 정비 후). noindex 처리는
// infra/seo/routeSeo.js 의 NOINDEX_PATHS 참조.
const CommunityPage = lazy(() => import("@/domains/community/mobile/CommunityScreen.jsx"));

export const PublicRoutes = [
  { index: true, element: <HomePage />, handle: ROUTE_META.HOME },
  { path: ROUTE_META.AUTH_CALL_BACK.path, element: <AuthCallback /> },
  { path: ROUTE_META.COUPONS.path, element: <CouponPage />, handle: ROUTE_META.COUPONS },
  { path: ROUTE_META.EVENTS.path, element: <EventPage />, handle: ROUTE_META.EVENTS },
  { path: ROUTE_META.NOTICES.path, element: <NoticePage />, handle: ROUTE_META.NOTICES },
  { path: ROUTE_META.NOTICE_DETAILS.path, element: <NoticeDetailPage />, handle: ROUTE_META.NOTICE_DETAILS },
  { path: ROUTE_META.ODDS.path, element: <OddsIndexPage />, handle: ROUTE_META.ODDS },
  { path: ROUTE_META.ODDS_SECTION.path, element: <OddsSectionPage />, handle: ROUTE_META.ODDS_SECTION },
  { path: ROUTE_META.PLAYERS.path, element: <PlayerEncyclopediaPage />, handle: ROUTE_META.PLAYERS },
  { path: ROUTE_PATHS.players_legacy_team_pattern, element: <PlayersLegacyRedirect /> },
  { path: ROUTE_PATHS.players_legacy_year_pattern, element: <PlayersLegacyRedirect /> },
  { path: ROUTE_META.LEGEND_MATERIALS.path, element: <LegendMaterialPage />, handle: ROUTE_META.LEGEND_MATERIALS },
  { path: ROUTE_META.LEGEND_STATS.path, element: <LegendStatsPage />, handle: ROUTE_META.LEGEND_STATS },
  { path: ROUTE_META.HISTORY_MODE.path, element: <HistoryModePage />, handle: ROUTE_META.HISTORY_MODE },
  { path: ROUTE_META.PRIVACY.path, element: <PrivacyPolicyPage />, handle: ROUTE_META.PRIVACY },
  { path: ROUTE_META.TERMS.path, element: <TermsPage />, handle: ROUTE_META.TERMS },
  { path: ROUTE_META.CONTACT.path, element: <ContactPage />, handle: ROUTE_META.CONTACT },
  { path: ROUTE_META.ABOUT.path, element: <AboutPage />, handle: ROUTE_META.ABOUT },
  { path: ROUTE_META.COMMUNITY.path, element: <CommunityPage />, handle: ROUTE_META.COMMUNITY },
];
