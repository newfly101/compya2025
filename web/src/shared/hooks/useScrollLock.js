import { useEffect } from "react";

export const useScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;

    const originalStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = originalStyle.position;
      document.body.style.top = originalStyle.top;
      document.body.style.width = originalStyle.width;

      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
