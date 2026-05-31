// app/wrapper/mobile/hooks/useAdminTopBar.js
// admin 관리 화면 전용 TopBar — variant=page, back 버튼은 /admin 대시보드로 이동.
// unmount 시 home(default) 복원.
//
// 사용 예:
//   useAdminTopBar("쿠폰 관리");

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTopBar } from "@/app/provider/TopBarProvider";

export function useAdminTopBar(title) {
  const { setConfig } = useTopBar();
  const navigate = useNavigate();

  useEffect(() => {
    setConfig({
      variant: "page",
      title,
      rightAction: null,
      onBack: () => navigate("/admin"),
      onBurger: null,
    });

    return () => {
      setConfig({ variant: "home", title: null, rightAction: null, onBack: null, onBurger: null });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);
}
