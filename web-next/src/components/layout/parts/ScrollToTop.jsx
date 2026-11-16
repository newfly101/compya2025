"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

// 스크롤 컨테이너는 window 가 아니라 [data-scroll-root] — 경로가 바뀌면 최상단으로(원본 MobileLayout 동작).
export default function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    document.querySelector("[data-scroll-root]")?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
