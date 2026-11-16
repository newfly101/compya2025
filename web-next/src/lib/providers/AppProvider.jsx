"use client";
import QueryProvider from "@/lib/query/QueryProvider.jsx";
import ResponseListener from "@/stores/operation/ResponseListener.jsx";
import AuthProvider from "@/lib/providers/AuthProvider.jsx";
import CheckInToast from "@/features/gamification/components/CheckInToast.jsx";

// Redux 대신 TanStack Query(서버 데이터) + Zustand(세션·토스트 등 클라이언트 상태).
// 공개 SSR 페이지는 이 둘을 쓰지 않아 서버 렌더 결과에 영향이 없다.
const AppProvider = ({ children }) => (
  <QueryProvider>
    <ResponseListener />
    <CheckInToast />
    <AuthProvider>{children}</AuthProvider>
  </QueryProvider>
);

export default AppProvider;
