// src/app/wrapper/RootLayout.jsx
// v2.0.0 mobile 분기 처리를 위한 hooks 26.04.10
import { useIsMobile } from "@/app/hooks/useIsMobile";
import App from "./AppWrapper";
import MobileWrapper from "./MobileWrapper.jsx";

const RootLayout = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileWrapper /> : <App />;
};

export default RootLayout;
