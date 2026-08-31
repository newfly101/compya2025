// src/app/wrapper/AppWrapper.jsx
import { useGA4PageView } from "@/infra/analytics/hooks/useGA4PageView.js";
import { useDocumentMeta } from "@/infra/seo/useDocumentMeta.js";
import MobileLayout from "@/app/wrapper/mobile/MobileLayout.jsx";

const AppWrapper = () => {
  // title/description/canonical 을 GA4 page_view 보다 먼저 세팅 — GA4 가 document.title 을 읽는다
  useDocumentMeta();
  useGA4PageView();

  return <MobileLayout />
};

export default AppWrapper;
