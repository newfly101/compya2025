import { useCallback, useEffect, useState } from "react";

export const useHeaderUI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const openMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback( () => {
    setIsClosing(true);
  }, []);

  const onAnimationEnd = useCallback(() => {
    if (isClosing) {
      setIsOpen(false);
      setIsClosing(false);
    }
  }, [isClosing]);

  const toggleMenu = useCallback(() => {
    if (isOpen) closeMenu();
    else openMenu();
  }, [isOpen, openMenu, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return {
    isOpen,
    isClosing,
    toggleMenu,
    closeMenu,
    onAnimationEnd,
  };
}
