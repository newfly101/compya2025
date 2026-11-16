import "@/styles/global.scss";
import MobileLayout from "@/components/layout/MobileLayout.jsx";
import { SITE_URL } from "@/lib/env.js";
import { DEFAULT_OG_IMAGE } from "@/lib/seo.js";
import GoogleAnalytics from "@/lib/analytics/GoogleAnalytics.jsx";
import AppProvider from "@/lib/providers/AppProvider.jsx";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "컴프야펀 | 컴투스프로야구2026 정보 · 이벤트 · 정보글 모음", template: "컴프야펀 | %s" },
  description:
    "컴프야펀은 컴투스 프로야구 공식 공지, 이벤트, 쿠폰, 공략 정보를 한눈에 볼 수 있는 팬 사이트입니다.",
  keywords:
    "컴프야, 컴투스프로야구, 컴프야2025, 컴프야 이벤트, 컴프야 공지, 컴프야 쿠폰, 컴프야 공략, 컴프야2025 쿠폰, 컴프야2026, 컴프야2026 쿠폰, 컴프야2026 공략, 컴프야2026 이벤트",
  authors: [{ name: "컴프야펀" }],
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
  openGraph: {
    type: "website",
    siteName: "컴프야펀",
    locale: "ko_KR",
    url: SITE_URL,
    title: "컴프야펀 | 컴투스 프로야구 정보 허브",
    description: "컴투스 프로야구 공식 공지·이벤트·공략을 한 곳에서 확인하세요.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "컴프야펀 | 컴투스 프로야구 정보 허브",
    description: "컴투스 프로야구 공식 공지·이벤트·공략을 한 곳에서 확인하세요.",
    images: ["/compyafun2026.jpg"],
  },
  verification: { other: { "naver-site-verification": "4363833a93bf2e4134d3cdfe67e1699f071863fe" } },
  // 소유권 확인용 — 광고 스크립트는 승인 전까지 로드하지 않는다(원본 index.html 에서도 주석 처리)
  other: { "google-adsense-account": "ca-pub-8723423525807131" },
};

export const viewport = { width: "device-width", initialScale: 1, colorScheme: "dark light" };

// 기기 밝은톤/다크 설정을 따라간다. 첫 페인트 전에 실행해 FOUC 방지(원본 index.html 과 동일)
const THEME_SCRIPT =
  "(function(){var mq=matchMedia('(prefers-color-scheme: light)');var apply=function(m){if(m.matches)document.documentElement.dataset.theme='light';else delete document.documentElement.dataset.theme;};apply(mq);mq.addEventListener('change',apply);})();";


// ponytail: 'Inter' 는 원본에서도 로드하지 않아 시스템 폰트로 떨어진다 — 동일 동작 유지
export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <AppProvider>
          <MobileLayout>{children}</MobileLayout>
        </AppProvider>
        <GoogleAnalytics />
        {/* 모달 포털 자리 — 원본 index.html 의 #modal */}
        <div id="modal" />
      </body>
    </html>
  );
}
