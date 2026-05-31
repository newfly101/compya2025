// src/app/provider/TopBarProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";

const TopBarContext = createContext(null);

export function TopBarProvider({ children }) {
  const [config, setConfig] = useState({
    variant: "home",
    title: null,
    rightAction: null,
    onBack: null,
    onBurger: null,
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  return (
    <TopBarContext.Provider value={{
      config,
      setConfig,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    }}>
      {children}
    </TopBarContext.Provider>
  );
}

export function useTopBar() {
  return useContext(TopBarContext);
}

// [NOTE] useSetTopBar 는 deps [] 로 마운트 시 1회 설정만 함.
// unmount 시 복원(cleanup) 없음 — 이를 원하면 useDomainTopBar 사용.
// (web/src/app/wrapper/mobile/hooks/useDomainTopBar.js)
export function useSetTopBar(config) {
  const { setConfig } = useTopBar();
  useEffect(() => {
    setConfig(config);
  }, []);
}
