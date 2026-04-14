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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const openDrawer  = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

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
  )
}

export function useTopBar() {
  return useContext(TopBarContext)
}

export function useSetTopBar(config) {
  const { setConfig } = useTopBar()
  useEffect(() => {
    setConfig(config)
  }, [])
}
