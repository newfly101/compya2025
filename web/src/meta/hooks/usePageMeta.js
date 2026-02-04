import { useLocation } from "react-router-dom";
import { PAGE_META_REGISTRY } from "@/meta/index.js";

// route 기준으로 meta 정보 자동 주입용 훅
const useMetaByRoute = (pathname, registry) => {
  for (const feature of registry) {
    const { contexts } = feature;

    for (const key in contexts) {
      if (contexts[key].route === pathname) {
        return {
          feature: feature.feature,
          ...contexts[key],
        };
      }
    }
  }
  return null;
};


// 페이지 자동 주입
export const usePageMeta = () => {
  const { pathname } = useLocation();
  return useMetaByRoute(pathname, PAGE_META_REGISTRY);
};
