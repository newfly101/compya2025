"use client";
import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { pushEvent } from "@/lib/analytics/ga.js";

const GA_ID = "G-KCC3QTZWZW";
const DEV_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]"];

// 원본 index.html 규칙 그대로 — localhost 에서는 gtag.js 를 로드하지 않는다. gtag config 가 첫 page_view 를 자동 전송.
const INIT = `window.dataLayer=window.dataLayer||[];
if(${JSON.stringify(DEV_HOSTS)}.indexOf(location.hostname)===-1){
window.gtag=function(){window.dataLayer.push(arguments)};
gtag('js',new Date());gtag('config','${GA_ID}');
var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';document.head.appendChild(s);}`;

// 첫 진입 page_view 는 gtag config 가 자동 전송 → 이후 경로 변경(SPA 이동)만 직접 전송. 쿼리스트링은 원본과 같이 무시(pathname 만) → useSearchParams/Suspense 불필요.
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    pushEvent({
      event: "page_view",
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);
  return <Script id="ga-init" strategy="afterInteractive">{INIT}</Script>;
}
