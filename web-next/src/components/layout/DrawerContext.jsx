"use client";
import { createContext, useContext, useState, useMemo } from "react";

const DrawerContext = createContext({ isOpen: false, open() {}, close() {} });

export const DrawerProvider = ({ children }) => {
  const [isOpen, setOpen] = useState(false);
  const value = useMemo(() => ({ isOpen, open: () => setOpen(true), close: () => setOpen(false) }), [isOpen]);
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
};

export const useDrawer = () => useContext(DrawerContext);
