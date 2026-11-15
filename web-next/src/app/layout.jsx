import "@/styles/global.scss";
import MobileLayout from "@/layout/MobileLayout.jsx";
import { SITE_URL } from "@/config/env.js";
import AppProvider from "@/providers/AppProvider.jsx";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "컴프야펀 | 컴투스프로야구2026 정보 · 이벤트 · 정보글 모음", template: "컴프야펀 | %s" },
  description:
    "컴프야펀은 컴투스 프로야구 공식 공지, 이벤트, 쿠폰, 공략 정보를 한눈에 볼 수 있는 팬 사이트입니다.",
};

// ponytail: 'Inter' 는 원본에서도 로드하지 않아 시스템 폰트로 떨어진다 — 동일 동작 유지
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AppProvider>
          <MobileLayout>{children}</MobileLayout>
        </AppProvider>
        {/* 모달 포털 자리 — 원본 index.html 의 #modal */}
        <div id="modal" />
      </body>
    </html>
  );
}
