// src/app/provider/TopBarProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";

const TopBarContext = createContext(null)

export function TopBarProvider({ children }) {
  const [config, setConfig] = useState({
    variant: 'home',
    title: null,
    rightAction: null,
    onBack: null,
    onBurger: null,
  })

  return (
    <TopBarContext.Provider value={{ config, setConfig }}>
      {children}
    </TopBarContext.Provider>
  )
}

export function useTopBar() {
  return useContext(TopBarContext)
}

// 페이지에서 편하게 쓸 수 있는 커스텀 훅
export function useSetTopBar(config) {
  const { setConfig } = useTopBar()
  useEffect(() => {
    setConfig(config)
  }, [])
}
