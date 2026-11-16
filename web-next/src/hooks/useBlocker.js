import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// react-router 의 useBlocker 대체 — App Router 에는 이탈 차단 API 가 없다.
// 사이트 안 <a> 클릭(서랍·상단바 링크 포함)을 캡처 단계에서 막고, 화면이 proceed()/reset() 으로 결정한다.
// ponytail: 브라우저 뒤로가기(popstate)와 router.push 직접 호출은 못 막는다 — 새로고침·탭 닫기는 화면의 beforeunload 가 담당.
export const useBlocker = (shouldBlock) => {
  const router = useRouter();
  const [href, setHref] = useState(null);
  const check = useRef(shouldBlock);
  useEffect(() => {
    check.current = shouldBlock;
  });

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a[href]");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const currentLocation = { pathname: window.location.pathname };
      const nextLocation = { pathname: url.pathname };
      if (!check.current({ currentLocation, nextLocation })) return;
      e.preventDefault();
      e.stopPropagation();
      setHref(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const proceed = useCallback(() => {
    const to = href;
    setHref(null);
    if (to) router.push(to);
  }, [href, router]);
  const reset = useCallback(() => setHref(null), []);

  return { state: href ? "blocked" : "unblocked", proceed, reset };
};
