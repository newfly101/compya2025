import { useCallback, useEffect, useState } from "react";

// 재료 보유 체크 — 서버 API 가 붙기 전까지 localStorage 에 보관한다.
// 값은 boolean 뿐이다(수량 개념 없음). 키는 카드 단위라 같은 카드가 여러 레전드에
// 재료로 쓰이면 보유 상태를 공유한다.
const STORAGE_KEY = "legendMaterials.owned";

const read = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export function useOwnedMaterials() {
  const [owned, setOwned] = useState(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(owned));
    } catch {
      // 저장 실패(용량 초과·프라이빗 모드)해도 화면 동작은 막지 않는다.
    }
  }, [owned]);

  const toggle = useCallback((key) => {
    setOwned((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  }, []);

  const isOwned = useCallback((key) => Boolean(owned[key]), [owned]);

  return { owned, isOwned, toggle };
}
