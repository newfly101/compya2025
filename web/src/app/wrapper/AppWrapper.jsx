// src/app/wrapper/AppWrapper.jsx
import { useGA4PageView } from "@/app/analytics/hooks/useGA4PageView.js";
import MobileLayout from "@/app/wrapper/mobile/MobileLayout.jsx";

const AppWrapper = () => {
  useGA4PageView();

  return <MobileLayout />
};

export default AppWrapper;
