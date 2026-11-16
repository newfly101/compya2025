"use client";
import { useDrawer } from "@/components/layout/DrawerContext.jsx";

const BurgerButton = ({ className }) => {
  const { open } = useDrawer();
  return (
    <button type="button" className={className} onClick={open} aria-label="메뉴">
      <span /><span /><span />
    </button>
  );
};

export default BurgerButton;
