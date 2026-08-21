// domains/odds/mobile/hooks/useOddsTopBar.js
// 상세 화면(OddsSectionScreen) 전용 — TopBar 제목은 "확률 공시" 로 고정한다
// (섹션 제목은 길어서 TopBar 한 줄에 안 들어가므로 본문 상단에 별도 렌더).
// 뒤로가기는 항상 목차(/odds)로 이동 — 섹션 간 이전/다음 이동을 반복해도
// 뒤로가기가 엉뚱한 섹션으로 튀지 않도록 고정한다. 제목이 고정이라 deps 불필요.
// 목차(OddsIndexScreen)는 useDomainTopBar 를 쓴다.
//
// 사용 예:
//   useOddsTopBar();

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTopBar } from "@/app/provider/TopBarProvider";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";

export function useOddsTopBar() {
  const { setConfig } = useTopBar();
  const navigate = useNavigate();

  useEffect(() => {
    setConfig({
      variant: "page",
      title: "확률 공시",
      rightAction: null,
      onBack: () => navigate(ROUTE_PATHS.odds),
      onBurger: null,
    });

    return () => {
      setConfig({ variant: "home", title: null, rightAction: null, onBack: null, onBurger: null });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
