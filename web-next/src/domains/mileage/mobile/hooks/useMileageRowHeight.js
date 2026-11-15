// domains/mileage/mobile/hooks/useMileageRowHeight.js
// 구단×연도 표 행 높이 — 화면 높이 기반, 회전/리사이즈 대응.
// ref 는 호출부(컴포넌트)가 만들어 넘긴다 — 훅이 ref 를 다른 상태와 한 객체로 묶어
// 반환하면 react-hooks/refs 린트가 반환 객체 전체를 ref 로 오인해 오류를 낸다.

import { useLayoutEffect, useState } from "react";
import { computeRowHeight } from "@/domains/mileage/config/mileage.js";

const FALLBACK_HEAD_H = 42;

export function useMileageRowHeight(active, theadRef) {
  // 첫 렌더는 서버와 같은 값(800)으로 — window 는 마운트 후 layout effect 에서 읽는다(hydration 불일치 방지)
  const [rowH, setRowH] = useState(() => computeRowHeight(FALLBACK_HEAD_H, 800));

  useLayoutEffect(() => {
    if (!active) return undefined;
    const measure = () => {
      const headH = theadRef.current?.offsetHeight ?? FALLBACK_HEAD_H;
      setRowH(computeRowHeight(headH, window.innerHeight));
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return rowH;
}
