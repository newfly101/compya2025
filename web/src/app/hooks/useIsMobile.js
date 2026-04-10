// src/app/hooks/useIsMobile.js
import { useState, useEffect } from "react";

const STORAGE_KEY = "dev_mobile_mode";

/**
 * 모바일 감지 훅
 *
 * 개발 환경 강제 override 우선순위:
 *   1. URL ?mode=mobile | ?mode=pc  (붙이면 localStorage 저장 후 URL 정리)
 *   2. localStorage "dev_mobile_mode"  (새로고침 후에도 유지)
 *   3. window.innerWidth  (실제 디바이스 감지)
 *
 * 콘솔 단축키 (DEV only):
 *   __setMobileMode("mobile")  → 모바일 강제
 *   __setMobileMode("pc")      → PC 강제
 *   __setMobileMode("auto")    → override 해제
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => resolveInitial(breakpoint));

  useEffect(() => {
    // URL 쿼리 ?mode= 처리
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");

    if (mode === "mobile" || mode === "pc") {
      localStorage.setItem(STORAGE_KEY, mode);
      // URL에서 ?mode= 제거 (히스토리 오염 방지)
      params.delete("mode");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "") +
        window.location.hash;
      window.history.replaceState(null, "", newUrl);
      setIsMobile(mode === "mobile");
      return;
    }

    // localStorage override 있으면 width 감지 안 함
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "mobile" || stored === "pc") {
      setIsMobile(stored === "mobile");
      return;
    }

    // 실제 width 감지
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

function resolveInitial(breakpoint) {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "mobile") return true;
  if (stored === "pc")     return false;
  return window.innerWidth <= breakpoint;
}

// ── DEV 전용: 콘솔 헬퍼 등록 ────────────────────────────────
if (import.meta.env.DEV) {
  window.__setMobileMode = (mode) => {
    if (mode === "auto") {
      localStorage.removeItem(STORAGE_KEY);
      console.log("✅ override 해제 — 실제 width 기준");
    } else if (mode === "mobile" || mode === "pc") {
      localStorage.setItem(STORAGE_KEY, mode);
      console.log(`✅ 강제: ${mode}`);
    } else {
      console.warn('사용법: __setMobileMode("mobile" | "pc" | "auto")');
      return;
    }
    window.location.reload();
  };
}
