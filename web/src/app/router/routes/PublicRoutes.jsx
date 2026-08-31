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
const HistoryModePage = lazy(() => import("@/domains/historyMode/mobile/HistoryModeScreen.jsx"));
const PrivacyPolicyPage = lazy(() => import("@/domains/policy/mobile/PrivacyPolicyScreen.jsx"));
const TermsPage = lazy(() => import("@/domains/policy/mobile/TermsScreen.jsx"));
const ContactPage = lazy(() => import("@/domains/policy/mobile/ContactScreen.jsx"));
const AboutPage = lazy(() => import("@/domains/policy/mobile/AboutScreen.jsx"));

// community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
// CommunityPage 는 community IA 재개 시 도메인 mobile/feature 흡수 후 재도입

export const PublicRoutes = [
  { index: true, element: <HomePage />, handle: ROUTE_META.HOME.title },
  { path: ROUTE_META.AUTH_CALL_BACK.path, element: <AuthCallback /> },
  { path: ROUTE_META.COUPONS.path, element: <CouponPage />, handle: ROUTE_META.COUPONS.title},
  { path: ROUTE_META.EVENTS.path, element: <EventPage />, handle: ROUTE_META.EVENTS.title},
  { path: ROUTE_META.NOTICES.path, element: <NoticePage />, handle: ROUTE_META.NOTICES.title },
  { path: ROUTE_META.NOTICE_DETAILS.path, element: <NoticeDetailPage />, handle: ROUTE_META.NOTICE_DETAILS },
  { path: ROUTE_META.ODDS.path, element: <OddsIndexPage />, handle: ROUTE_META.ODDS.title },
  { path: ROUTE_META.ODDS_SECTION.path, element: <OddsSectionPage />, handle: ROUTE_META.ODDS_SECTION },
  { path: ROUTE_META.PLAYERS.path, element: <PlayerEncyclopediaPage />, handle: ROUTE_META.PLAYERS.title },
  { path: ROUTE_PATHS.players_legacy_team_pattern, element: <PlayersLegacyRedirect /> },
  { path: ROUTE_PATHS.players_legacy_year_pattern, element: <PlayersLegacyRedirect /> },
  { path: ROUTE_META.HISTORY_MODE.path, element: <HistoryModePage />, handle: ROUTE_META.HISTORY_MODE.title},
  { path: ROUTE_META.PRIVACY.path, element: <PrivacyPolicyPage />, handle: ROUTE_META.PRIVACY.title },
  { path: ROUTE_META.TERMS.path, element: <TermsPage />, handle: ROUTE_META.TERMS.title },
  { path: ROUTE_META.CONTACT.path, element: <ContactPage />, handle: ROUTE_META.CONTACT.title },
  { path: ROUTE_META.ABOUT.path, element: <AboutPage />, handle: ROUTE_META.ABOUT.title },
  // community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
  // community IA 재개 시 ROUTE_META.COMMUNITY + 도메인 mobile/feature 흡수 후 재도입

];
