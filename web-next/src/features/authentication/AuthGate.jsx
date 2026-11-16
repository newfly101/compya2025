"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore.js";

// 로그인 사용자 화면의 문. 세션 확인이 끝나기 전엔 비워 둔다(원본 AuthProvider 가 하던 일 — 공개 페이지는 막지 않으려고 여기로 옮김).
// guard: 비로그인이면 원래 가려던 주소를 저장하고 홈으로 보낸다(원본 AuthGuard). 없으면 비로그인도 통과 —
// 화면이 같은 주소에서 로그인 안내를 보여 준다(REQ-LCSK-24).
// allow: guard 일 때 허용할 role 목록.
const AuthGate = ({ guard = false, allow, children }) => {
  const router = useRouter();
  const initialized = useAuthStore((s) => s.initialized);
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.userRole);

  const denied = guard && initialized && (user === null || (allow && !allow.includes(userRole)));

  useEffect(() => {
    if (!denied) return;
    if (user === null) sessionStorage.setItem("redirectPath", window.location.pathname + window.location.search + window.location.hash);
    router.replace("/");
  }, [denied, user, router]);

  if (!initialized || denied) return null;
  return children;
};

export default AuthGate;
