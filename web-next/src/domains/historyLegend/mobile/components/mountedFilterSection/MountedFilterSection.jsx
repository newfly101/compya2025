"use client";
import { useSyncExternalStore } from "react";
import FilterSection from "@/global/ui/mobile/filterSection/FilterSection.jsx";

const subscribe = () => () => {};

// FilterSection 은 storageKey 가 있으면 첫 렌더에서 localStorage 를 읽는다 → SSR 과 펼침 상태가 어긋나 hydration 불일치.
// 서버·하이드레이션 첫 패스는 storageKey 없이(접힘) 그리고, 마운트 직후 key 를 바꿔 다시 세워 저장값을 반영한다.
// global 후보: FilterSection 이 직접 마운트 후 읽도록 고치면 이 래퍼는 필요 없다.
const MountedFilterSection = ({ storageKey, ...rest }) => {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return <FilterSection key={mounted ? "m" : "s"} storageKey={mounted ? storageKey : undefined} {...rest} />;
};

export default MountedFilterSection;
