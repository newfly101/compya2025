// app/wrapper/mobile/hooks/useDomainTopBar.js
// section variant TopBar 를 도메인 화면에서 간편하게 설정하는 hook.
// unmount 시 default(home) 복원 — useSetTopBar 의 cleanup 미복원 결함 보완.
//
// 사용 예:
//   useDomainTopBar("쿠폰");
//   useDomainTopBar({ title: "쿠폰", rightAction: <SomeIcon /> });

import { useEffect } from "react";
import { useTopBar } from "@/app/provider/TopBarProvider";

export function useDomainTopBar(arg) {
  const { setConfig } = useTopBar();

  const title = typeof arg === "string" ? arg : arg?.title ?? null;
  const rightAction = typeof arg === "object" && arg !== null ? (arg.rightAction ?? null) : null;

  useEffect(() => {
    setConfig({ variant: "section", title, rightAction, onBack: null, onBurger: null });

    return () => {
      // unmount 시 home(default) 복원
      setConfig({ variant: "home", title: null, rightAction: null, onBack: null, onBurger: null });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
